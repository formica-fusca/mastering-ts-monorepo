# Demo — ESM semantics: live bindings, hoisting, scope, top-level await

**Demonstrates:** lesson **1.1 — CommonJS vs ESM (syntax & semantics)**.

Specific facet: the four places where ESM's *runtime semantics* diverge from the CJS habits
you carry in. Not about which import syntax works — about what the code then **does**.

The sibling demos cover interop (`1.1-cjs-named-exports-lexer`,
`1.1-cjs-namespace-object`, `1.1-lexer-names-vs-runtime-values`). This one is what happens
after resolution succeeds.

## Layout

```
packages/
  counter-esm/   ESM.  export let count / export function inc()
  counter-cjs/   CJS.  same logic, but `exports.count = count` copies the value
  app/           ESM TypeScript consumer, one entry point per facet:
                   src/live-bindings.ts   imports BOTH counters, increments both
                   src/hoisting.ts        + src/side.ts
                   src/tla-plain.ts       no top-level await
                   src/tla-await.ts       top-level await
                   scope.mjs / scope.cjs  plain JS, see note below
                   require-esm.cjs        CommonJS requiring compiled ESM
```

The two counters are **deliberately functionally identical** — same logic, same intent, and
`index.d.ts` files with *identical types*. Nothing in the type system distinguishes a live
binding from a stale copy. That's the point.

`scope.mjs`, `scope.cjs` and `require-esm.cjs` are hand-written JS outside `tsconfig`'s
`include`. Module scope and `require()` are properties of the **runtime**, and routing them
through the compiler would put TypeScript's opinions between you and the behaviour under
study.

## Run it

```bash
pnpm install
pnpm lint        # exit 0
pnpm typecheck   # exit 0
pnpm build       # exit 0
pnpm demo        # all four, in order
```

Each facet also runs alone — useful when breaking one:

```bash
pnpm demo:bindings
pnpm demo:hoisting
pnpm demo:scope
pnpm demo:tla
```

## 1 — Live bindings

```
               ESM      CJS
before inc()   0        0
after  inc()   1        0

Both counters were incremented. Only the ESM reader observed it.
The CJS export is a copy, frozen at 0.
```

The verdict on the last two lines is **computed, not hardcoded** — the program compares the
two readers and reports what it found. That matters for the break-it exercise below, where
the answer changes and a baked-in conclusion would lie to you.

`exports.count = count` copies the **value** at the moment that line runs; the copy has no
further relationship to the variable. An ESM `import` is a **reference into the exporting
module's scope**, so it reflects whatever the exporter's variable currently holds.

**This is the worst failure mode in lesson 1.1.** Everything else either refuses to start or
hands you `undefined`. This hands you *a number* — stale, entirely plausible — and your
program keeps computing with it. A cache reporting the wrong size; a feature flag frozen at
its startup value; a config object stuck at import time. Nothing errors, so nothing points at
the module system.

## 2 — Imports are hoisted

`src/hoisting.ts` puts its import on **line 3**, after two `console.log` calls:

```
  [side.ts body ran]          <- FIRST, before line 1
=== evaluation order =======================
  [importer body starts]
  [importer body ends]
```

Import declarations are not statements executed in place. They are hoisted, and the entire
dependency subgraph evaluates before the importing module's body begins. Hence
`if (x) import 'y'` is a syntax error, and hence dynamic `import()` — Promise-returning, legal
in both CJS and ESM — is the escape hatch.

## 3 — Module scope

Two separate programs, one per module system:

```
$ node scope.mjs                       $ node scope.cjs
typeof this        : undefined         this === module.exports? true
import.meta.dirname: string            typeof __dirname        : string
typeof __dirname   : undefined
```

ESM is always strict mode; `this` is `undefined` at module top level, where CJS gives you
`module.exports`. `__dirname`, `__filename`, `require`, `module` and `exports` are absent.
Replacements: `import.meta.url`, `import.meta.dirname` / `import.meta.filename` (Node 20.11+),
and `createRequire(import.meta.url)` — which `src/live-bindings.ts` uses to pull in the CJS
counter.

## 4 — Top-level await and `require(esm)`

Two ESM modules, identical but for one `await`, required from a CommonJS file:

```
require tla-plain.js -> no TLA
require tla-await.js -> ERR_REQUIRE_ASYNC_MODULE  <- top-level await
```

Top-level `await` makes a module's **evaluation asynchronous**. `require()` is synchronous and
must return a value, so a module that cannot finish evaluating synchronously cannot be
`require`d — **by construction**, not by policy. This is Node's 2009 decision still binding in
2026.

## Break it

**Break 1 — make the CJS counter behave like the ESM one.** In
`packages/counter-cjs/index.js`, replace the value copy with a getter:

```js
// was: exports.count = count
Object.defineProperty(exports, 'count', { get: () => count, enumerable: true })
```

Then `pnpm demo:bindings`. **Expect** (verified):

```
after  inc()   1        1

Both readers observed the increment.
The CJS package is exposing a live view, not a value copy.
```

A getter re-reads the variable on every access, which is what a live binding does. Note what
this tells you: CJS *can* express live semantics — it just doesn't by default, and
`exports.x = x` is the shape everyone writes.

**Break 2 — remove the asynchrony.** In `packages/app/src/tla-await.ts`, replace the awaited
promise with a synchronous value:

```js
// was: await new Promise((resolve) => setTimeout(resolve, 1))
await 0
```

Then `pnpm build && pnpm demo:tla`. **Expect** (verified): *still*
`ERR_REQUIRE_ASYNC_MODULE`. `await 0` resolves immediately, but the module's evaluation is
still asynchronous — the presence of top-level `await` changes the module's **kind**, not just
its timing. A useful correction if you assumed "fast enough" was the criterion.

**Break 3 — move the import in `hoisting.ts` to line 1.** **Expect:** identical output. The
position of an import declaration in the file has no effect whatsoever, which is the cleanest
possible proof that it isn't a statement.

## References

- MDN — [`export` (live bindings)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)
- Node.js — [ECMAScript modules: differences between ES modules and CommonJS](https://nodejs.org/api/esm.html#differences-between-es-modules-and-commonjs)
- Node.js — [`module.createRequire()`](https://nodejs.org/api/module.html#modulecreaterequirefilename)

Verified on Node v24.18.0, pnpm 11.9.0, TypeScript 5.9.3.
