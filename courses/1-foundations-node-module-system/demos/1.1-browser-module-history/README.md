# Demo — what a browser page looked like, and why it had to change

**Illustrates:** lesson **1.1 — history**.

Specific facet: why ES2015 standardised module *syntax* but **no loader**, and why a
`package.json` `"exports"` field is meaningless in a browser. Five pages, one per era.

> **Deviates from the project's demo contract, deliberately.** This is not a pnpm monorepo
> and has no `lint` / `typecheck` / `build` scripts. It is a browser-history illustration,
> not a monorepo demo, and a workspace here would be ceremony. Zero dependencies, zero build.

## Run it

```bash
node server.mjs      # → http://localhost:8080
```

That is the entire setup. **Open the DevTools console before clicking through** — on pages 3
and 5 the console and the server log *are* the demonstration. The server prints every request
it receives, which is half the evidence.

A server is required: `file://` blocks ES modules and import maps under the same-origin
policy. That is itself part of the story.

## The five pages

### 1 — Script tags and globals (2009–2015)

```html
<script src="./js/legacy-lib.js"></script>
<script src="./js/legacy-app.js"></script>
```

`legacy-lib.js` assigns `window.Greeter`. `legacy-app.js` uses it. There is no import, no
export, no declared dependency — **tag order is the dependency**. This is exactly how jQuery
worked (`window.jQuery`, `window.$`).

The thing to absorb: in this world there is no such concept as a *package*, so there is
nothing for an `"exports"` field to live in and nothing to read it.

**Break it:** swap the two `<script>` tags. Console: `ReferenceError: Greeter is not defined`.
Nothing warned you, because nothing knew.

### 2 — Native ESM: a specifier is a URL

```js
import { greet } from './esm-lib.js'
```

Now the dependency is declared, and the browser resolves it with the only algorithm it has:
**URL resolution**. `./esm-lib.js` resolves against the importing module's own URL →
`http://localhost:8080/js/esm-lib.js` → HTTP GET.

Note also that no global leaks: the page prints `typeof window.Greeter → undefined`.

**Break it:** drop the `.js` in `js/esm-app.js`. The server log shows `404 /js/esm-lib` —
the browser does not guess extensions. Verified:

```
404  /js/esm-lib
200  /js/esm-lib.js
```

Same rule that makes `moduleResolution: "nodenext"` demand `.js` in TypeScript source
(lesson 3.2).

### 3 — The wall: bare specifiers are illegal

```js
import { greet } from 'esm-lib'   // no ./ and no .js
```

What you write in Node every day. In a browser it is a hard error and the module never runs.

**Expected console output:**

```
TypeError: Failed to resolve module specifier "esm-lib".
Relative references must start with either "/", "./", or "../".
```

(Wording varies slightly by browser; Chrome's is above.)

`'esm-lib'` is not a URL and not relative to one. No filesystem to walk, no `node_modules`
convention, no `package.json` to consult. **There is no algorithm available**, so the browser
refuses rather than guesses.

Check the server log for this page: you see the HTML request and *nothing else*. Resolution
failed before any fetch was attempted.

### 4 — Import maps: the page supplies the URL

```html
<script type="importmap">
  { "imports": { "esm-lib": "/js/esm-lib.js" } }
</script>
<script type="module">
  import { greet } from 'esm-lib'   // identical to page 3 — now legal
</script>
```

A complete specifier→URL table, known *before* the first import runs.

**The comparison worth holding:** an import map and a `package.json` `"exports"` field solve
the same problem — mapping a name to a location — with the authority inverted.

|  | `"exports"` | import map |
|---|---|---|
| Who decides | the **package** | the **page** |
| When | at resolution time, after the package is found | upfront, before anything is fetched |
| Requires | a filesystem to search | nothing |

### 5 — Why `node_modules` could not work over HTTP

The page performs *the same sequence of lookups Node performs*, over HTTP, against a server
that delays every `/simulate/` response by 50 ms (measured: 52 ms).

```
If the browser implemented Node's node_modules walk:
  404    ~50ms  /simulate/src/node_modules/greeter/package.json
  200    ~50ms  /simulate/node_modules/greeter/package.json
  200    ~50ms  /simulate/node_modules/greeter/index.js
  ---------------------------------------------
  TOTAL ~150ms to resolve ONE bare specifier

With an import map (name -> URL known upfront):
  200    ~50ms  /simulate/cdn/greeter/index.js
  ---------------------------------------------
  TOTAL ~50ms
```

Three round trips for **one** import — and the resolved file has imports of its own, which
restart the sequence. The waterfall is as deep as your dependency tree.

**This is the whole argument.** Node's algorithm assumes *failed lookups are nearly free*: a
`stat` on a missing path costs microseconds. Over HTTP a failed lookup is a full round trip
you must wait for. The same algorithm that is elegant on a filesystem is pathological over a
network.

**Break it:** raise `SIMULATED_RTT_MS` in `server.mjs` from 50 to 300 (a bad mobile
connection) and reload. The walk crosses a second — for one import, at depth one.

## The conclusion the demo is built to earn

Neither host could adopt the other's model:

```
browser                     server
───────                     ──────
URLs, HTTP, CORS            filesystem paths
no filesystem               node_modules walking
latency forbids probing     package.json, "exports", symlinks
must know upfront           probing is free
```

Node could not switch to URLs — a decade of npm was built on the folder convention. The
browser could not adopt `node_modules` — page 5 is why. Neither side could yield, so TC39
standardised the part they agreed on (**how a module graph links**) and left resolution to
the host.

That single decision is why `moduleResolution` exists as a TypeScript option at all: TS must
model *the host's* algorithm, and there are several hosts. Lesson **3.2**.

## References

- WHATWG HTML — [Import maps](https://html.spec.whatwg.org/multipage/webappapis.html#import-map)
- MDN — [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- Node.js — [Modules: Packages](https://nodejs.org/api/packages.html)

Server behaviour verified on Node v24.18.0. Page 3's console wording and page 5's in-browser
timings are stated as expectations — they have not been captured from a live browser session.
