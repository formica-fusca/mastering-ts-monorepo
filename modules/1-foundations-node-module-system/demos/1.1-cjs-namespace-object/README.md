# Demo — the CJS namespace object is not `module.exports`

**Demonstrates:** lesson **1.1 — CommonJS vs ESM (interop rules)**.

Specific facet: what `import * as ns` actually hands you when the target is a CommonJS
package, and how that differs from a true ESM package. The short version: it is **not** the
`module.exports` object. It is a synthesized, sealed **Module Namespace Object**.

## Layout

```
packages/
  cjs-logger/    CJS. module.exports = createLogger  (a function)
                      + .createLogger + .LEVELS member assignments
  esm-logger/    True ESM. Named exports only — NO default export.
  app/           ESM TypeScript. Compares the two namespaces side by side.
                   src/main.ts       → typechecked comparison + the trap
                   raw-import.mjs    → the escape hatch (JS only, see below)
```

## Run it

```bash
pnpm install
pnpm lint        # exit 0
pnpm typecheck   # exit 0
pnpm build       # exit 0
pnpm demo
```

## What to observe

```
=== CJS package: synthesized namespace ==================
namespace keys        [ 'LEVELS', 'createLogger', 'default', 'module.exports' ]
has "default"?        true
typeof namespace      object
namespace callable?   false        <- module.exports IS a function...
default callable?     true         <- ...but the namespace is not it
Symbol.toStringTag    Module
extensible?           false

=== true ESM package: real namespace ====================
namespace keys        [ 'LEVELS', 'createLogger' ]
has "default"?        false
```

**1. A CJS namespace always has `default`. A true ESM namespace has it only if declared.**

`esm-logger` exports no default, so there is no `default` key at all. For `cjs-logger`, Node
*synthesizes* `default` from the guaranteed contract (`default === module.exports`). This is
the cleanest way to tell, at runtime, what kind of module you are looking at.

**2. The namespace is not callable, even when the module's export is a function.**

```
calling the namespace -> TypeError: cjsNs is not a function
[debug] calling .default works
```

This is a real migration bug. CJS code that read

```js
const logger = require('@demo/cjs-logger')
logger({ level: 'debug' })
```

gets rewritten to `import * as logger` during an ESM migration and dies — because `require`
returns `module.exports` itself, while `import * as` returns a wrapper around it.
`import logger from '@demo/cjs-logger'` is the correct translation.

**3. The namespace is non-extensible.**

`Object.isExtensible(ns) === false`. Monkey-patching the result of `require()` is a common
CJS trick (test stubs, instrumentation, polyfills). It simply cannot work through an ESM
namespace — the spec seals it. Worth remembering when a test helper that patches a module
stops working after an ESM migration.

**4. The `'module.exports'` key — and why it lives in a `.mjs` file.**

ES2022 permits arbitrary *string* names in module namespaces, and Node uses that to expose
the raw `module.exports` under the literal name `"module.exports"`. It is the clean escape
hatch for point 2:

```js
import { 'module.exports' as rawExports } from '@demo/cjs-logger'
rawExports({ level: 'warn' })   // ✓ this IS module.exports
```

```
typeof rawExports     function
callable directly?    true
rawExports.LEVELS     [ 'debug', 'info', 'error' ]
```

Note where that file sits: `packages/app/raw-import.mjs`, hand-written JS, deliberately
outside `tsconfig`'s `include`. **TypeScript cannot type this import** — `index.d.ts` has no
way to declare a synthesized key that only Node invents. Another instance of the recurring
theme: the type system and the module loader are describing different things.

## Break it

In `packages/app/src/main.ts`, the call to the namespace is wrapped in a `try/catch` so the
demo can print the error and keep going. Remove the wrapper and call it directly:

```ts
import * as cjsNs from '@demo/cjs-logger'
cjsNs.default({ level: 'debug' }).log('ok')   // replace this line with:
// (cjsNs as any)({ level: 'debug' })
```

**Expect:** `typecheck` and `build` still pass (the `as any` sees to that — which is the
point: the cast is how this reaches production). At runtime the process exits with
`TypeError: cjsNs is not a function`.

Then try the honest fix — change `esm-logger/index.js` to add `export default createLogger`
and re-run. **Expect:** the true ESM namespace now *does* have a `default` key, and the two
namespaces finally look alike. That is the tell that the `default` key says nothing about
whether a module is CJS or ESM once the author opts in — only its *absence* is informative.

## References

- Node.js — [Interoperability with CommonJS](https://nodejs.org/api/esm.html#interoperability-with-commonjs)
- TC39 — [Arbitrary Module Namespace Identifier Names](https://github.com/tc39/ecma262/pull/2154) (ES2022)
- MDN — [Module namespace object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)

Verified on Node v24.18.0, pnpm 11.9.0, TypeScript 5.9.3.
