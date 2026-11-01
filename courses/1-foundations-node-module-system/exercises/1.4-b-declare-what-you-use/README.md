# 1.4-b — Declare what you use

**From:** lesson 1.4, hoisting and phantom dependencies. Do [1.4-a](../1.4-a-spot-the-phantoms/) first.

## Goal

Same hoisted workspace shape as 1.4-a. `packages/api/index.js` requires three packages and
runs fine on every developer machine:

```
$ cd tree && node packages/api/index.js
**    api up** in 42ms
```

Its `package.json` declares one of them. Make `api` **survive being installed alone**, the
way it will be in a Docker build from a pruned lockfile, a `pnpm deploy`, or a strict pnpm
layout: with exactly what it declares and nothing else.

## The constraints

1. **Edit only `packages/api/package.json`.** Not `index.js`: the code is not the bug.
2. **Do not touch the root `package.json`.** Declaring at the root makes the import resolve
   in this workspace and fixes nothing. The verifier hashes it.
3. **Do not touch `node_modules/`.** You are not the package manager.
4. **Declare versions that exist.** The verifier acts as a tiny package manager: for each
   dependency you declare, it looks for an installed copy whose version satisfies your spec
   (exact, `^`, or `~`), copies only those next to a copy of `api`, and runs it there.

## Verify

```bash
node verify.mjs
```

Four checks guard the constraints, one confirms `api` still runs in the workspace, and the
last two install `api` alone with its declared dependencies and run it.

## Hints

<details>
<summary>Hint 1 — find the phantoms</summary>

Compare the `require()` calls in `index.js` with the `dependencies` of `api`'s own manifest.
Anything in the first list and not in the second only works because someone else's
declaration hoisted it within reach.
</details>

<details>
<summary>Hint 2 — which version to write</summary>

The version `api` has been running with is the one at the top of the tree. `node -p
"require('./tree/node_modules/chalk/package.json').version"` is one way to read it. Declare
that major. Declaring a different one will fail the install step, with the versions actually
on disk listed in the message.
</details>

<details>
<summary>Hint 3 — if you are tempted by the root</summary>

Putting `chalk` and `ms` in the root `package.json` would make the hoisted workspace keep
working, exactly as it does now. The verifier's solo install does not read the root, and
neither does a Docker build of `api`. That is the whole lesson.
</details>

## What this is really testing

That you fix a phantom dependency at the **package that uses it**, with a version that
matches what it actually runs, and that you recognise "declare it at the root" as hoisting
by hand. The solo install is what pnpm's isolated layout gives you for free on every
`pnpm install`; here you get it only when you ask.
