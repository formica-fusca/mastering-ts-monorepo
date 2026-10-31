# 1.2-b — Fix the require stack

**From:** lesson 1.2, the `node_modules` resolution algorithm. Do [1.2-a](../1.2-a-predict-the-resolution/) first.

## Goal

```bash
cd tree && node app/main.cjs
```

currently dies with:

```
Error: Cannot find module 'dep'
Require stack:
- .../tree/packages/lib/index.js
- .../tree/app/main.cjs
```

Make it print `HELLO FROM LIB`.

```
tree/
  app/
    main.cjs                      require('@demo/lib')
    node_modules/
      @demo/lib -> ../../../packages/lib    (symlink, the way pnpm would link it)
      dep/                                  the app installed dep
  packages/lib/
    index.js                      require('dep')   <- lib uses it, never declared it
    package.json
```

## The constraints

1. **Do not edit any existing file.** Not `main.cjs`, not `lib/index.js`, not the two
   `package.json`s, not `dep`. The verifier hashes all of them.
2. **Do not replace the symlink** with a copy of the library. It must stay a symlink to
   `../../../packages/lib`.
3. **No flags, no environment.** The verifier runs plain `node app/main.cjs` with `NODE_PATH`
   and `NODE_OPTIONS` stripped. `--preserve-symlinks` is not an answer.

You may only **add** things: files, directories, symlinks.

Realistic framing: a workspace library forgot to declare a dependency, and you cannot
touch the library's source today. You still need the app to start. Where does the missing
piece have to go so that *Node's walk from the library* finds it?

## Verify

```bash
node verify.mjs
```

Six checks guard the constraints, two check the goal, one confirms the fix is in a place the
library can actually see. When it passes, the verifier prints where `dep` was found. Look at
that path and ask whether it is the place a package manager would have put it.

## Hints

<details>
<summary>Hint 1 — read the stack from the bottom</summary>

`main.cjs` required `@demo/lib`. That worked. `@demo/lib` required `dep`. That failed. So
the question is not "where is dep" but "where does **lib's** walk for dep look". Note the
path Node printed for lib: it is `packages/lib/index.js`, not `app/node_modules/@demo/lib/...`.
That is the real path, and the walk starts there.
</details>

<details>
<summary>Hint 2 — list the candidates</summary>

```bash
cd tree && node -p "require('module').createRequire(require('path').resolve('packages/lib/index.js')).resolve.paths('dep')"
```

Every directory in that list would work. `app/node_modules` is not in it, which is the
entire bug.
</details>

<details>
<summary>Hint 3 — which candidate is the right one</summary>

Putting `dep` at the tree root works and is what hoisting package managers do. Putting it in
`packages/lib/node_modules/` works and is what pnpm does when `lib` *declares* `dep`. You are
doing by hand what `pnpm install` would do after the one-line `package.json` fix that
constraint 1 forbids today. A symlink to the app's copy is enough; you do not need to
duplicate the files.
</details>

## What this is really testing

That you locate a resolution failure at the right **layer** and the right **location**: it
is the library's dependency, resolved from the library's real path, and no amount of
installing things into the app will reach it. The temptation to answer "the package manager
would hoist it" is exactly the layer confusion this lesson's check-in question surfaced.
