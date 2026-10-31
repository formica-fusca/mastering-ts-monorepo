# Demo — real-path resolution vs `--preserve-symlinks`

**Demonstrates:** lesson **1.2 — the `node_modules` resolution algorithm**.

Specific facet: the upward walk for a bare specifier starts from the importing file's
**real path**, not from the symlink it was reached through. Two consequences follow, and
this demo shows both:

1. **Where a package finds its own dependencies** is decided by where the package really
   lives on disk, not by which `node_modules` folder linked to it.
2. **Module identity** is the resolved path. One real path means one module instance shared
   by every consumer; two paths mean two instances with separate state.

pnpm, npm and yarn workspaces all link workspace packages with symlinks, so this is the
mechanism every monorepo runs on, whether or not anyone looks at it.

## Layout

```
packages/
  dep/    CJS. Has module-level STATE (a call counter) so that "one instance or two?"
          is directly observable, not inferred.
  lib/    CJS. Declares `dep`. Reports where it is running from and where it found `dep`.
  web/    TypeScript, compiled to CJS. Declares BOTH `@demo/lib` and `dep`. Compares
          its `dep` with the one `lib` got.
```

After `pnpm install` the workspace links look like this, and the links are the exhibit:

```
packages/web/node_modules/@demo/lib  ->  ../../../lib
packages/web/node_modules/dep        ->  ../../dep
packages/lib/node_modules/dep        ->  ../../dep
```

## Run it

`node_modules` is **installable** here. pnpm builds the symlinks the demo relies on.

```bash
pnpm install
pnpm lint          # exit 0
pnpm typecheck     # exit 0
pnpm build         # exit 0
pnpm demo          # default Node behaviour: symlinks resolved to real paths
pnpm demo:preserve # same program under node --preserve-symlinks
```

## What to observe

### Default: real paths

```
=== mode: default (realpath) ===

--- where Node thinks each module lives ---
web  resolved @demo/lib -> <root>/packages/lib/index.js
lib  is running from    -> <root>/packages/lib/index.js
web  resolved dep       -> <root>/packages/dep/index.js
lib  resolved dep       -> <root>/packages/dep/index.js

--- module identity ---
same dep instance for web and lib? true
web touched dep; calls seen by this instance = 1
lib touched dep; calls seen by this instance = 2

--- what is in the module cache for dep ---
  <root>/packages/dep/index.js
```

`web` required `@demo/lib` through `packages/web/node_modules/@demo/lib`, but Node reports
the module as living at `packages/lib/index.js`. The symlink was followed before anything
else happened. So when `lib` asked for `dep`, the walk began at `packages/lib/`, found
`packages/lib/node_modules/dep`, followed that symlink too, and landed on
`packages/dep/index.js`. `web`'s own walk landed on the same real file. **Same path, same
cache key, same instance**: the counter reaches 2.

### `--preserve-symlinks`: the paths you typed

```
=== mode: preserve-symlinks ===

--- where Node thinks each module lives ---
web  resolved @demo/lib -> <root>/packages/web/node_modules/@demo/lib/index.js
lib  is running from    -> <root>/packages/web/node_modules/@demo/lib/index.js
web  resolved dep       -> <root>/packages/web/node_modules/dep/index.js
lib  resolved dep       -> <root>/packages/web/node_modules/@demo/lib/node_modules/dep/index.js

--- module identity ---
same dep instance for web and lib? false
web touched dep; calls seen by this instance = 1
lib touched dep; calls seen by this instance = 1

--- what is in the module cache for dep ---
  <root>/packages/web/node_modules/dep/index.js
  <root>/packages/web/node_modules/@demo/lib/node_modules/dep/index.js
```

Same files on disk. Now `lib` "lives" at the symlink path, so its walk for `dep` starts
there and reaches `dep` through a *different* chain of links. Two distinct resolved paths,
two cache entries, **two instances of `dep` with two independent counters**. Each consumer
sees `calls = 1`.

In a real application this is the shape of "two copies of React", a singleton that is not
a singleton, an `instanceof` that fails across packages, or an event emitter nobody else is
listening to. Node made real-path resolution the default in 2016 precisely to make this
impossible by construction, and pnpm's single-store-many-symlinks layout (lesson 2.2) is
only viable because of it.

### A note on the `import` form in `main.ts`

`web` uses `import dep = require('dep')` rather than `import * as dep from 'dep'`. With the
second form TypeScript emits `__importStar(require('dep'))`, a **synthesized namespace
wrapper** around `module.exports`, so `dep === lib.dep` is `false` even when there is a
single module instance. That is the same namespace-is-not-`module.exports` trap from lesson
1.1, this time produced by the compiler instead of by Node. Identity comparisons must be
made on `module.exports` itself.

## Break it

Make `lib` forget to declare its dependency. In `packages/lib/package.json`, delete the
`dependencies` block entirely, then re-link and run:

```bash
pnpm install        # removes packages/lib/node_modules — lib now declares nothing
pnpm demo
pnpm demo:preserve
```

**Expect from `pnpm demo`:** a hard failure, with the require stack naming the real path
of the library that did the borrowing:

```
Error: Cannot find module 'dep'
Require stack:
- <root>/packages/lib/index.js
- <root>/packages/web/dist/main.js
```

Trace it: `lib` really lives at `packages/lib/`, so the walk is
`packages/lib/node_modules` (gone), `packages/node_modules`, `<root>/node_modules`, and so
on up to `/`. `dep` is in none of them. `web`'s copy at `packages/web/node_modules/dep` is
never on the path.

**Expect from `pnpm demo:preserve`:** it works, silently. `lib` is now walking from
`packages/web/node_modules/@demo/lib/`, which climbs into `packages/web/node_modules/` and
finds `web`'s copy of `dep`. The undeclared dependency is satisfied by the consumer's
dependency, and will stay satisfied until some other app consumes `@demo/lib` without
installing `dep` itself. That is a **phantom dependency** (lesson 1.4), and the default
real-path behaviour is what turns it from a silent landmine into a loud error at the right
place.

Restore the `dependencies` block and run `pnpm install` to return to the shipped state.

## The rule to carry forward

> A package resolves its dependencies from where it **really** lives. If a `Cannot find
> module` error names a workspace package in its require stack, that package is missing a
> declaration, not the app.

## References

- Node.js — [Modules: CommonJS → All together](https://nodejs.org/api/modules.html#all-together)
  (the pseudo-code for `LOAD_NODE_MODULES` and `NODE_MODULES_PATHS`)
- Node.js — [`--preserve-symlinks`](https://nodejs.org/api/cli.html#--preserve-symlinks)
- Node.js — [Modules: ECMAScript modules → Resolution algorithm](https://nodejs.org/api/esm.html#resolution-algorithm)

Verified on Node v24.18.0, pnpm 11.9.0, TypeScript 5.9.3.
