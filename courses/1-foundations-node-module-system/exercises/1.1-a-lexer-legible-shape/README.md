# 1.1-a — Make the lexer see it

**From:** lesson 1.1, interop rules.

## Goal

Make `hello` and `version` importable as **named exports** from an ESM consumer:

```js
import { hello, version } from './bad.cjs'
```

Right now that fails. `bad.cjs` is the file to edit.

## The constraint

**Do not change what the module exports at runtime.** Same keys, same values, same behaviour.
You may change only the *shape of the source*.

That constraint is the whole exercise. If you're allowed to change the runtime exports, this
is trivial and teaches nothing.

## Verify

```bash
node verify.mjs
```

Five checks: three confirm you honoured the constraint, two confirm you reached the goal.

## Hints

<details>
<summary>Hint 1 — where to look</summary>

Nothing about the *values* is wrong. Compare `bad.cjs` with `good.cjs`, which already works,
and ask what a parser reading **source text without executing it** could extract from each.
</details>

<details>
<summary>Hint 2 — the mechanism</summary>

`cjs-module-lexer` recognises a fixed set of patterns. Three of them are relevant here:

```js
exports.name = ...
module.exports.name = ...
module.exports = { name, other }      // object LITERAL, plain keys
```

`bad.cjs` matches none of them. Which one can you reach without changing the resulting object?
</details>

<details>
<summary>Hint 3 — if you're stuck on "runtime unchanged"</summary>

`{ hello, version }` and an object built by assigning `.hello` and `.version` onto `{}` are
the *same object* as far as any consumer can tell — same keys, same values, same prototype.
Only the source text differs. That is exactly the latitude the constraint gives you.
</details>

## What this is really testing

That you can look at a CommonJS file and predict, from its source shape alone, whether ESM
consumers will be able to name-import from it. That prediction is the practical skill from
1.1 — and it is the review skill that catches this bug before it ships, since no type checker
will.
