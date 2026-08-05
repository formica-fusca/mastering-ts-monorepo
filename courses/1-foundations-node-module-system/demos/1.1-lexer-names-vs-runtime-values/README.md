# Demo — the lexer supplies names, the runtime supplies values

**Demonstrates:** lesson **1.1 — CommonJS vs ESM (interop rules)**.

Specific facet: the **quiet** failure mode. The other 1.1 demos fail loudly, at link time,
with a `SyntaxError` you cannot miss. This one does not fail at all — it hands you
`undefined` and lets your program continue.

The rule: **`cjs-module-lexer` decides which names exist; the runtime `module.exports`
object decides what they are worth.** When those two disagree, nothing warns you.

## Layout

```
packages/
  ghost-cjs/   CJS with two exports the lexer sees but the runtime may not provide:
                 (1) `ghost`       — assigned, then `delete`d
                 (2) `betaFeature` — assigned inside an `if (process.env...)`
  app/         ESM TypeScript importing all three names.
```

Only two packages here; the third would be decoration.

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
=== what the LEXER decided (names) ======================
namespace keys        [ 'betaFeature', 'default', 'ghost', 'module.exports', 'real' ]

=== what the RUNTIME provided (values) =================
typeof real           function
typeof ghost          undefined
typeof betaFeature    undefined
ENABLE_BETA           (unset)

=== the consequence ====================================
real() -> I exist at runtime
ghost() -> TypeError: ghost is not a function
```

**1. `ghost` is in the namespace but has no value.**

The source text contains `exports.ghost = ...`, so the lexer recorded the name. It never
sees the `delete` on the next line, because it does not execute anything. The import
therefore *links successfully* — and yields `undefined`.

**2. There is no import error. The failure is deferred to the call site.**

`import { ghost }` succeeds. The program runs. It dies later, somewhere else, with
`TypeError: ghost is not a function` — a message that points at your code and says nothing
about module resolution. Compare with the sibling demo `1.1-cjs-named-exports-lexer`, where
the same underlying subject produces a `SyntaxError` naming the offending package. **Loud
failures are a gift; this is the version without the gift.**

**3. `betaFeature` is the realistic version.**

Nobody ships `delete exports.x`. Plenty of packages ship

```js
if (process.env.ENABLE_BETA === '1') {
  exports.betaFeature = () => 'beta enabled'
}
```

or the same gate on `process.platform`, `NODE_ENV`, or a feature flag. The lexer reads the
assignment inside the `if` and reports the name unconditionally, because it is reading text,
not evaluating a condition.

**4. `index.d.ts` is complicit.**

The declaration file declares all three as functions — exactly what a package author would
naturally write. `typecheck` passes. The types describe the *optimistic* runtime, and no
type checker can see the gate.

## Break it

No file edits needed for this one — the break is an environment variable:

```bash
pnpm demo                  # typeof betaFeature -> undefined
ENABLE_BETA=1 pnpm demo    # typeof betaFeature -> function
```

**Expect:** identical build output, identical `dist/`, no recompilation — and a named import
that changes from `undefined` to `function` based on ambient environment. Verified:

```
=== default ===                    === ENABLE_BETA=1 ===
typeof betaFeature  undefined      typeof betaFeature  function
```

Sit with that for a second. This is why a bug reproduces on your machine and not in staging,
with no diff between them.

**Second break, for the loud version.** In `packages/ghost-cjs/index.js`, replace the whole
body with a single dynamic assignment so the lexer finds *nothing*:

```js
const impl = { real: () => 'I exist at runtime' }
module.exports = impl
```

Then `pnpm build && pnpm demo`. **Expect:** the failure mode flips from silent `undefined`
to a link-time `SyntaxError: Named export 'real' not found`. Same package, same intent —
whether you get the loud failure or the quiet one is decided entirely by which source shape
the lexer can read.

## The rule to carry forward

> A named import from a CJS package succeeding tells you the **lexer** approved.
> It does not tell you the value exists.

Diagnostic habit: when a workspace package's named import is mysteriously `undefined`,
compare `Object.keys(namespace)` against the actual `module.exports` at runtime. A key
present in the first and absent in the second is this bug, every time.

## References

- Node.js — [Interoperability with CommonJS](https://nodejs.org/api/esm.html#interoperability-with-commonjs)
- [`cjs-module-lexer`](https://github.com/nodejs/cjs-module-lexer) — the detected-patterns
  list is the whole contract

Verified on Node v24.18.0, pnpm 11.9.0, TypeScript 5.9.3.
