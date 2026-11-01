# Demo — `exports` seals the package

**Demonstrates:** lesson **1.3 — `package.json` anatomy: `main`, `exports`, `types`, `files`,
conditional exports**.

Specific facets, all in one tiny workspace:

1. **Encapsulation.** With an `exports` map, a package has an interior. Files that exist on
   disk, including the entry file itself under its physical path, are refused by specifier.
2. **Conditions.** One public name, `"."`, serves a different file to an `import` consumer
   and to a `require()` consumer. The `types` condition is for TypeScript, which ignores
   nothing and enforces the same map.
3. **Subpath patterns** and the explicitly exported `./package.json`.
4. **The dual package hazard.** Two conditions, two files, and by lesson 1.2's rule two
   module instances in the same process.
5. **Condition order is precedence**, exhibited by the break-it.

## Layout

```
packages/
  config/     The sealed package. "type": "module". No build step: lib/ is hand-written
              so the exports targets are visible in the repo.
    lib/index.js          ESM entry           ← "import"
    lib/index.cjs         CJS entry           ← "require"
    lib/fallback.cjs      "default" target    (unreachable in the shipped state)
    lib/index.d.ts        types               ← "types"
    lib/utils/math.js     reached via "./utils/*"
    lib/internal-notes.js exists, NOT exported
  app-esm/    TypeScript, "type": "module". Imports ".", "./utils/math", "./package.json",
              probes two sealed paths, then triggers the dual package hazard on purpose.
  app-cjs/    TypeScript, "type": "commonjs". Requires "." and probes a sealed path.
```

The map under test, in `packages/config/package.json`:

```json
"exports": {
  ".": {
    "types": "./lib/index.d.ts",
    "import": "./lib/index.js",
    "require": "./lib/index.cjs",
    "default": "./lib/fallback.cjs"
  },
  "./utils/*": "./lib/utils/*.js",
  "./package.json": "./package.json"
}
```

## Run it

`node_modules` is **installable**.

```bash
pnpm install
pnpm lint          # exit 0
pnpm typecheck     # exit 0
pnpm build         # exit 0
pnpm demo          # runs the ESM consumer, then the CJS consumer
```

## What to observe

```
=== ESM consumer ===
"." resolved to        : lib/index.js (ESM)
"./utils/*" pattern     : add(2, 3) = 5
"./package.json"        : version 1.4.2
config loaded from lib/index.js (ESM)

--- sealed: the physical path of the entry is NOT a public name ---
import @demo/config/lib/index.js -> ERR_PACKAGE_PATH_NOT_EXPORTED
import @demo/config/internal-notes.js -> ERR_PACKAGE_PATH_NOT_EXPORTED

--- the dual package hazard, in one process ---
import  gave : lib/index.js (ESM)
require gave : lib/index.cjs (CJS)
same instance? false
hits seen by import side: 1, by require side: 1

=== CJS consumer ===
"." resolved to        : lib/index.cjs (CJS)
config loaded from lib/index.cjs (CJS)
require @demo/config/lib/index.cjs -> ERR_PACKAGE_PATH_NOT_EXPORTED
```

**1. The same specifier gives each consumer a different file.** `@demo/config` is
`lib/index.js` for the ESM app and `lib/index.cjs` for the CJS app. Nothing in the consumers
chose this; the package did, by condition.

**2. `main` was never consulted.** It points at `./lib/index.cjs` and exists only for tooling
that predates `exports`. Delete it and nothing in this demo changes.

**3. The entry's real path is refused.** `lib/index.js` *is* the file the ESM app is
running, yet `import '@demo/config/lib/index.js'` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`.
That is the guarantee: consumers depend on names, never on layout, so `lib/` can be renamed
without a breaking change. Note the error code: not `MODULE_NOT_FOUND`. The walk found the
package; the package declined.

**4. `./package.json` had to be exported by hand.** Sealing seals the manifest too. Plenty
of tools read a dependency's `package.json` for its version; this line is how you let them.

**5. The dual package hazard.** The ESM app also `require()`s the package through
`createRequire`, which a dependency written in CJS would do implicitly. Two conditions
matched, two files resolved, and by lesson 1.2 two resolved paths are two module instances:
`same instance? false`, and each side's counter reads 1 after two loads. Lesson 4.3 is about
designing packages so this cannot happen; here you only need to see the mechanism.

**6. TypeScript enforces the same map.** `moduleResolution: nodenext` reads `exports` and
resolves the `types` condition. The two sealed probes in `app-esm/src/main.ts` are built from
strings for exactly this reason. Add this line to `main.ts` and run `pnpm typecheck`:

```ts
import { entry } from '@demo/config/lib/index.js'
```

**Expect:** `error TS2307: Cannot find module '@demo/config/lib/index.js' or its
corresponding type declarations.` The compiler refuses before Node ever would. Remove the
line afterwards.

## Break it

### Break 1 — put `default` first

In `packages/config/package.json`, move the `"default"` line to the **top** of the `"."`
conditions object, so it reads `default`, `types`, `import`, `require`. Then:

```bash
pnpm typecheck   # still exit 0 — types unchanged, the type checker is blind to this
pnpm demo
```

**Expect:** every consumer gets the fallback.

```
"." resolved to : lib/fallback.cjs (DEFAULT — you should not be seeing this)
import  gave    : lib/fallback.cjs (DEFAULT — you should not be seeing this)
require gave    : lib/fallback.cjs (DEFAULT — you should not be seeing this)
same instance?  true
```

Node matches conditions in key order and `default` matches everyone, so the three entries
below it are now dead code. No error, no warning. Observe the irony in the last line: the
dual package hazard vanished, because both consumers now load the *same wrong file*.
`default` goes last, always. Restore the order afterwards.

### Break 2 — drop the manifest export

Delete the `"./package.json": "./package.json"` line and run `pnpm typecheck`.

**Expect:** TypeScript fails first, `TS2307: Cannot find module '@demo/config/package.json'`,
and if you build anyway, Node fails at link time with `ERR_PACKAGE_PATH_NOT_EXPORTED` for
subpath `./package.json`, before a single line of the ESM app has run (imports are hoisted,
lesson 1.1). This is the most common `exports` complaint in the ecosystem. Restore the line.

## The rule to carry forward

> `exports` is a map from public names to private files. Decide the names first. Put
> `types` first and `default` last. Export `./package.json` explicitly. Everything not in
> the map does not exist.

## References

- Node.js — [Modules: Packages → Package entry points](https://nodejs.org/api/packages.html#package-entry-points)
- Node.js — [Conditional exports](https://nodejs.org/api/packages.html#conditional-exports)
  and [Subpath patterns](https://nodejs.org/api/packages.html#subpath-patterns)
- Node.js — [Dual package hazard](https://nodejs.org/api/packages.html#dual-package-hazard)

Verified on Node v24.18.0, pnpm 11.9.0, TypeScript 5.9.3.
