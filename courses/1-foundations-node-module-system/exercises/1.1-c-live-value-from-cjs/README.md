# 1.1-c — Observing a live value from CJS

**From:** lesson 1.1, syntax & semantics. Hardest of the three. Do a and b first.

## Goal

`consumer.mjs` must print:

```
before inc(): 0
after  inc(): 1
```

It currently prints `0` then `0`. You may edit **both** `counter.cjs` and `consumer.mjs`.

## The constraint

**`counter.cjs` stays CommonJS.** No `"type": "module"`, no rewrite to `export` syntax.
The verifier checks the source for ESM export syntax and fails if it finds any.

Realistic framing: this is a package you depend on and cannot convert. You need the live
value anyway.

## Verify

```bash
node verify.mjs
```

Four checks: the CommonJS constraint, that `module.exports` exposes a live value, and the two
lines the consumer must print.

## Warning

**The obvious fix is only half the answer.** You will probably find a way to make
`module.exports.count` live, watch that check go green, and still see the consumer print `0`.
That is not a bug in the exercise. It is the thing the exercise exists to teach.

## Hints

<details>
<summary>Hint 1 — why the starter fails</summary>

```js
exports.count = count
```

copies the *value* of `count` at the moment that line runs. The copy on the exports object
has no further relationship to the variable. `inc()` bumps the variable; the copy stays put.
</details>

<details>
<summary>Hint 2 — making the exports object live</summary>

A property does not have to be a stored value. It can be an accessor that re-reads the
variable on every access. Note that `cjs-module-lexer` only recognises this in the exact
shape transpilers emit — `enumerable: true` and a `function () { ... }` getter, not an arrow.
Worth knowing, though for this exercise the lexer may not be the thing standing in your way.
</details>

<details>
<summary>Hint 3 — the half you're missing</summary>

Node builds ESM named exports from a CJS module by **copying the properties once, after
evaluation**. They are a snapshot, not live bindings. So even a perfect getter cannot make
`import { count }` update.

Verified on Node v24.18.0, with a correctly-written getter in place:

```
named  before: 0 | default before: 0
named  after : 0 | default after : 1
       ^^^^^ stale             ^^^^^ live
```

Only one import form reads `module.exports` itself on every access. Which one? (Lesson 1.1:
"the always-safe form".)
</details>

## What this is really testing

Two things at once:

1. **Live bindings are an ESM-to-ESM property.** They do not survive the CJS boundary as
   named imports, no matter what the exporting package does.
2. **`import { x }` and `import ns from` are not interchangeable when the target is CJS.**
   One is a post-evaluation snapshot; the other is the live `module.exports` object. Most of
   the time they behave identically, which is exactly why the difference bites when it
   finally matters.

This is the quietest failure in Module 1: no error, no `undefined` — a stale but entirely
plausible value that your program keeps computing with.
