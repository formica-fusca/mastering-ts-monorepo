# 1.3-b — Fix the condition order

**From:** lesson 1.3, conditional exports. Do [1.3-a](../1.3-a-write-the-exports-map/) first.

## Goal

`tree/node_modules/shape` ships five correct files and a conditions object that lists them
in the wrong order. Right now every consumer gets `lib/legacy.cjs`. Make this true:

| Consumer | Must load |
|---|---|
| `import 'shape'` | `lib/index.js` |
| `require('shape')` | `lib/index.cjs` |
| `import 'shape'` under `node --conditions=development` | `lib/index.dev.js` |
| `require('shape')` under `node --conditions=development` | `lib/index.dev.js` |

and keep `types` where TypeScript needs it.

## The constraint

**Reorder only.** Same five conditions, same five targets, nothing added, nothing removed,
nothing else in `package.json` touched, no file in `lib/` edited. The verifier compares the
set of entries with the original and fails on any difference other than order.

## Verify

```bash
node verify.mjs
```

Three checks guard the constraint, one checks the `types` rule, four run Node from inside
`tree/` and read which file it picked.

## Hints

<details>
<summary>Hint 1 — what Node does with the object</summary>

Node walks the keys **in order** and takes the first condition that matches the current
request. It never ranks them. The object's order *is* the precedence.
</details>

<details>
<summary>Hint 2 — which pairs can collide</summary>

Order only matters between conditions that can **both** match one request. `import` and
`require` never collide. `default` collides with everything. `development` is a custom
condition, active only with `--conditions=development`, and when active it must beat both
`import` and `require`, so where does it have to sit relative to them?
</details>

<details>
<summary>Hint 3 — the two fixed positions</summary>

`types` first, because TypeScript stops at the first match and Node ignores it. `default`
last, because it matches everyone. Everything else is a question of which specific condition
should win over which.
</details>

## What this is really testing

That you treat a conditions object as an ordered precedence list and reason about **which
conditions can collide**, instead of shuffling keys until the error goes away. This exercise
exists because of the check-in answer in lesson 1.3, which proposed swapping `import` and
`require`: a swap that can never change anything.
