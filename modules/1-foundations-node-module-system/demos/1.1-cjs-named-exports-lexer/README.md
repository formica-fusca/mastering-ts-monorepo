# Demo — CJS named exports and `cjs-module-lexer`

**Demonstrates:** lesson **1.1 — CommonJS vs ESM (interop rules)**.

Specific facet: *why* a named import from a CommonJS package works for one package and
fails for another, when both have identical runtime exports. The deciding factor is the
**source shape**, read statically by
[`cjs-module-lexer`](https://github.com/nodejs/cjs-module-lexer).

## Layout

```
packages/
  legible-cjs/   CJS. module.exports = { formatDate, parseDate }
                 → object literal, plain keys → lexer reads both names
  opaque-cjs/    CJS. module.exports = Object.assign(createFormatter, { formatDate })
                 → lexer reads NOTHING
  app/           ESM TypeScript. Imports named bindings from both.
                   src/good.ts  → against legible-cjs
                   src/bad.ts   → against opaque-cjs
```

`legible-cjs` and `opaque-cjs` are hand-written JavaScript on purpose. `tsc` **cannot emit
the broken shape** — compile idiomatic TypeScript to CommonJS and you always get
`exports.x = ...`, which the lexer reads perfectly. In real life the broken package is never
one you authored; it is a dependency, built by someone else's bundler. The demo mirrors that.

## Run it

```bash
pnpm install
pnpm lint        # exit 0
pnpm typecheck   # exit 0
pnpm build       # exit 0
pnpm demo        # good.js prints; bad.js dies
```

## What to observe

**1. The whole pipeline is green and the app does not start.**

`lint`, `typecheck`, and `build` all pass. None of them models Node's linking step.
TypeScript reads `opaque-cjs/index.d.ts`, which *accurately* describes the runtime object,
and concludes `import { formatDate }` is well-typed. It is well-typed. It simply cannot be
linked. This is the strongest possible motivation for lesson **4.4** (`arethetypeswrong`,
`publint`): those tools exist because `tsc` is structurally incapable of catching this.

**2. `good.js` succeeds.**

```
named import formatDate : 2026-08-05
named import parseDate  : 2026
default import keys     : [ 'formatDate', 'parseDate' ]
```

**3. `bad.js` fails at LINK time, not runtime.**

```
import { formatDate } from '@demo/opaque-cjs';
         ^^^^^^^^^^
SyntaxError: Named export 'formatDate' not found. The requested module
'@demo/opaque-cjs' is a CommonJS module, which may not support all
module.exports as named exports.
```

The tell is `SyntaxError`, not `TypeError`. And note what is **absent** from the output:
`bad.ts` has a `console.log` on the line *after* the import, and it never prints. The module
never reached evaluation. That is the observable difference between ESM's link phase and its
evaluate phase.

**4. The two packages are runtime-identical.**

`Object.assign(createFormatter, { formatDate })` produces exactly the same object as
`module.exports = createFormatter; module.exports.formatDate = formatDate`. Same properties,
same values. Only the *source text* differs — and only the source text is what the lexer
sees.

## Break it

**Break the working one.** In `packages/legible-cjs/index.js`, replace the export with a
runtime-equivalent but lexer-opaque shape:

```js
// was: module.exports = { formatDate, parseDate }
const api = {}
api.formatDate = formatDate
api.parseDate = parseDate
module.exports = api
```

Then `pnpm build && pnpm demo`.

**Expect:** `lint`, `typecheck`, and `build` still pass — nothing about the types changed.
`good.js` now dies with the same `SyntaxError`, this time naming `@demo/legible-cjs`. You
changed no exported value, no signature, and no declaration file. You changed four lines of
formatting and broke every ESM consumer.

**Then repair the broken one** (the reverse move). In `packages/opaque-cjs/index.js`:

```js
// was: module.exports = Object.assign(createFormatter, { formatDate })
module.exports = createFormatter
module.exports.formatDate = formatDate
```

**Expect:** `bad.js` now runs. Member assignments to `module.exports` are a shape the lexer
recognises, so `formatDate` becomes a real named export — while the module still exports a
callable function as `default`. This is the correct way to ship a "callable package with
helper properties."

## References

- Node.js — [Interoperability with CommonJS](https://nodejs.org/api/esm.html#interoperability-with-commonjs)
- [`cjs-module-lexer`](https://github.com/nodejs/cjs-module-lexer) — the README lists every
  detected pattern; worth reading once, in full.

Verified on Node v24.18.0, pnpm 11.9.0, TypeScript 5.9.3.
