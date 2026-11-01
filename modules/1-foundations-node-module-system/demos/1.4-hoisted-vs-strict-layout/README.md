# Demo — hoisted vs strict layout

**Demonstrates:** lesson **1.4 — hoisting, phantom dependencies, and why they cause bugs**.

Specific facet: the **same two `package.json` files** produce two different `node_modules`
layouts depending on one pnpm setting, and a phantom import that is impossible under one
layout works silently under the other, at a version the importer never chose.

## Layout

```
packages/
  a/   declares is-odd 3.0.1 only. is-odd depends on is-number ^6.
       a's code ALSO requires is-number, which it never declared. That is the phantom.
  b/   declares is-number 7.0.0. An unrelated sibling whose only role is to put a
       different major of is-number into the workspace.
scripts/layout.mjs   prints the linker pnpm actually used and the node_modules on a's walk
```

`a` is TypeScript. Neither `is-odd` nor `is-number` ships types, so `a` carries an ambient
declaration for both. Keep that in mind: **`pnpm typecheck` passes in every state of this
demo**, because the type checker is reading the declaration file, not the disk.

## Run it

`node_modules` is **installable**. The shipped state is pnpm's default, isolated layout.

```bash
pnpm install
pnpm lint          # exit 0
pnpm typecheck     # exit 0
pnpm build         # exit 0
pnpm layout        # which linker produced node_modules, and what is on a's walk
pnpm demo
```

## What to observe

### Shipped state: isolated (pnpm default)

```
node-linker used for this install: isolated

packages/a/node_modules/
  is-odd -> ../../../node_modules/.pnpm/is-odd@3.0.1/node_modules/is-odd
node_modules/
  eslint -> .pnpm/eslint@9.39.5/node_modules/eslint
  typescript -> .pnpm/typescript@5.9.3/node_modules/typescript
  ...                                       (root devDependencies only)
```

```
=== package a ===
a declares        : is-odd
is-odd resolved   : <root>/node_modules/.pnpm/is-odd@3.0.1/node_modules/is-odd/index.js
is-odd depends on : is-number 6.0.0

--- the phantom: a never declared is-number ---
require("is-number") -> MODULE_NOT_FOUND
a cannot reach a package it never declared. This is the correct outcome.
```

Trace `a`'s walk with 1.2 in hand: `packages/a/node_modules` holds only `is-odd`;
`packages/node_modules` does not exist; the root `node_modules` holds tooling. Nothing on the
way up is called `is-number`, so the phantom fails on the first install, with a require stack
that names `a`. Meanwhile `is-odd` finds its own `is-number` fine: its real path is inside
`.pnpm/is-odd@3.0.1/node_modules/`, where pnpm placed a sibling symlink to `is-number@6.0.0`.

Two things pnpm did **not** do here are worth stating. It did not check anything: the layout
is the check. And it did not hide `is-number` from `is-odd`: the strictness is per package,
by directory shape, not global.

## Break it

### Break 1 — switch to the hoisted linker

Add one line to `pnpm-workspace.yaml`:

```yaml
packages:
  - 'packages/*'
nodeLinker: hoisted
```

then reinstall from clean and rerun:

```bash
rm -rf node_modules packages/*/node_modules
pnpm install
pnpm typecheck     # still exit 0 — the type checker is blind to this
pnpm build
pnpm layout
pnpm demo
```

**Expect:** a flat root `node_modules` with every transitive dependency in it, and the phantom
working:

```
node-linker used for this install: hoisted

node_modules/
  ...
  is-number
  is-odd
  ...

=== package a ===
a declares        : is-odd
is-odd resolved   : <root>/node_modules/is-odd/index.js
is-odd depends on : is-number 6.0.0

--- the phantom: a never declared is-number ---
a gets is-number  : 6.0.0 at <root>/node_modules/is-number/index.js
same copy as is-odd uses? true
```

Same manifests, same lockfile semantics, same code. The undeclared import now resolves. Note
which version won the root slot: pnpm's hoisted linker put `is-odd`'s `is-number@6` at the
root and nested `b`'s `is-number@7` under `packages/b/node_modules`. npm, given the same two
manifests, does the opposite (the lesson file shows that run). **Which version a phantom gets
is an implementation detail of the package manager's hoisting algorithm**, not a decision
anyone made.

> On pnpm 11.9 this setting is read from `pnpm-workspace.yaml`. A `node-linker=hoisted` line
> in `.npmrc` was ignored on this machine (`pnpm config get node-linker` printed `undefined`,
> and `pnpm install` reported "Already up to date"). Also note that changing the linker does
> not always relink an existing `node_modules`; the clean reinstall above is deliberate.

### Break 2 — the version flips because of an unrelated change

Stay hoisted. In `packages/a/package.json`, delete the `dependencies` block entirely: `a`
stops using `is-odd`, which is a perfectly ordinary cleanup. `a`'s phantom `is-number` is
untouched. Then:

```bash
pnpm install
pnpm build
pnpm demo
```

**Expect:**

```
=== package a ===
a declares        : (nothing)
is-odd            : not declared, not reachable

--- the phantom: a never declared is-number ---
a gets is-number  : 7.0.0 at <root>/node_modules/is-number/index.js
```

With `is-odd` gone, nothing needs `is-number@6` any more, so `b`'s `is-number@7` takes the
root slot. `a`'s `require('is-number')` now returns a **different major version**, and `a`'s
diff shows only a removed dependency. No error, no warning, types still pass. This is the quiet
failure mode of 1.4: a phantom's version is decided by whichever declared dependency happens
to be nearest at install time, and that set changes under your feet.

### Restore

Put the `dependencies` block back in `packages/a/package.json`, remove the `nodeLinker` line
from `pnpm-workspace.yaml`, then reinstall from clean:

```bash
rm -rf node_modules packages/*/node_modules
pnpm install && pnpm build && pnpm demo
```

`pnpm layout` should report `isolated` again and the phantom should fail again.

## The rule to carry forward

> A phantom dependency is a gap between what a package declares and what it can reach.
> Hoisting creates the gap; the isolated layout closes it by shape. Fix a phantom at the
> package that uses it, never at the root.

## References

- pnpm — [Motivation: flat node_modules is not the only way](https://pnpm.io/motivation)
- pnpm — [Symlinked `node_modules` structure](https://pnpm.io/symlinked-node-modules-structure)
- pnpm — [`nodeLinker`](https://pnpm.io/settings#nodelinker),
  [`hoistPattern`](https://pnpm.io/settings#hoistpattern),
  [`publicHoistPattern`](https://pnpm.io/settings#publichoistpattern),
  [`shamefullyHoist`](https://pnpm.io/settings#shamefullyhoist)
- Node.js — [Loading from `node_modules` folders](https://nodejs.org/api/modules.html#loading-from-node_modules-folders)

Verified on Node v24.18.0, pnpm 11.9.0, TypeScript 5.9.3.
