# 1.1-b — The callable package

**From:** lesson 1.1, interop rules. Do [1.1-a](../1.1-a-lexer-legible-shape/) first.

## Goal

Make this work from ESM:

```js
import createLogger, { LEVELS } from './logger.cjs'
```

`logger.cjs` is the file to edit.

## The constraint

**The default export must stay callable.** `createLogger({ level: 'debug' })` has to keep
working — the package is a function *and* a namespace.

This is 1.1-a plus one requirement, and that requirement is what makes it real. Plenty of
npm packages ship this shape: `debug`, `chalk` (historically), most middleware factories.
It's also the shape that most often breaks, because the obvious way to write it —
`Object.assign(fn, { ...helpers })` — is invisible to the lexer.

## Verify

```bash
node verify.mjs
```

Two checks guard the constraint (default callable, and it still produces a working logger);
two check the goal.

## Hints

<details>
<summary>Hint 1 — why the object-literal trick from 1.1-a won't work here</summary>

In 1.1-a you could reach for `module.exports = { hello, version }`. Try that here and the
default export becomes a plain object — no longer callable. The constraint rules it out, so
you need a different recognised pattern.
</details>

<details>
<summary>Hint 2 — the other recognised patterns</summary>

The lexer also reads member assignments:

```js
module.exports.name = ...
```

Those work on an export that is already a function. So: what if the assignment of the
function and the assignment of the helpers were **separate statements**?
</details>

<details>
<summary>Hint 3 — the general rule to take away</summary>

```js
module.exports = Object.assign(fn, { helper })    // ✗ lexer sees nothing
module.exports = fn                                // ✓
module.exports.helper = helper                     // ✓
```

Runtime-identical. Only one of them is linkable. When you review a package that does the
first, this is the fix to suggest.
</details>

## What this is really testing

Whether you can satisfy two constraints that pull in opposite directions — "be a function"
and "be statically readable" — using only knowledge of what the lexer recognises. It is the
single most common real-world instance of the 1.1 failure mode.
