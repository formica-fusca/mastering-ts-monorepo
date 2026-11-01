# Demo — lockfile anatomy

**Demonstrates:** lesson **1.5 — lockfiles and deterministic installs**.

Specific facets: what `pnpm-lock.yaml` records per workspace package, which of those entries
are held in place *only* by the lockfile, what `--frozen-lockfile` compares, and what you
lose when the lockfile is regenerated.

## Layout

```
packages/
  web/   dependencies: semver ^7.5.0      ← a RANGE, locked at 7.5.4
  api/   dependencies: is-odd 3.0.1       ← exact
scripts/report.mjs   reads pnpm-lock.yaml and prints what it pins, per importer
```

The root also pulls in ESLint and TypeScript, whose own dependency trees bring a *second*
`semver` into the graph. That is deliberate: it shows two versions of one package coexisting
because two consumers asked for different ranges.

## Run it

`node_modules` is **installable**. The lockfile is committed and is the subject.

```bash
pnpm install
pnpm lint          # exit 0
pnpm typecheck     # exit 0
pnpm build         # exit 0
pnpm demo
```

## What to observe

```
=== pnpm-lock.yaml  (lockfileVersion 9.0) ===

importer . (workspace root)
  devDependencies  typescript           ^5.9.2       -> 5.9.3      RANGE — pinned only by this lockfile
  devDependencies  yaml                 ^2.6.0       -> 2.9.1      RANGE — pinned only by this lockfile
  ...
importer packages/api
  dependencies     is-odd               3.0.1        -> 3.0.1      pinned by manifest
importer packages/web
  dependencies     semver               ^7.5.0       -> 7.5.4      RANGE — pinned only by this lockfile

packages  : 118 distinct name@version entries, 118 with an integrity hash
snapshots : 118 graph nodes

semver in the graph:
  semver@7.5.4   wanted by: importer packages/web
  semver@7.8.5   wanted by: @typescript-eslint/typescript-estree@8.72.1(typescript@5.9.3)
layout settings in the lockfile: {"autoInstallPeers":true,"excludeLinksFromLockfile":false}  (no nodeLinker — the layout is not pinned here)

web: semver 7.5.4, valid('1.2.3') = 1.2.3
api: is-odd present: true
```

**1. `importers` is the join between intent and fact.** Each workspace package, each declared
dependency, the `specifier` copied from the manifest and the `version` it resolved to. The
report tags every specifier that is a range: those versions exist nowhere but in this file.
Delete it and every one of them is up for renegotiation.

**2. Two semvers, two reasons.** `web` asked for `^7.5.0` at a time when the lockfile already
held `7.5.4` (it was pinned exactly first, then the range was widened; see the lesson). The
ESLint toolchain asked for a range that resolved to `7.8.5` when it was first added. Both are
correct resolutions of their own constraints; the lockfile keeps both.

**3. Every package has an integrity hash.** 118 of 118. That is the supply-chain half of the
file: the exact bytes that were reviewed when each dependency entered the graph.

**4. The layout is not here.** No `nodeLinker`, no hoisting settings. Lesson 1.4's demo
produced two different `node_modules` from one lockfile; this is why.

## Break it

### Break 1 — change a range, let CI install

In `packages/web/package.json`, change `"semver": "^7.5.0"` to `"semver": "^7.6.0"`. Do not
touch the lockfile. Then simulate CI:

```bash
CI=true pnpm install
```

**Expect:**

```
[ERR_PNPM_OUTDATED_LOCKFILE] Cannot install with "frozen-lockfile" because pnpm-lock.yaml
is not up to date with <ROOT>/packages/web/package.json
Note that in CI environments this setting is true by default.
  - semver (lockfile: ^7.5.0, manifest: ^7.6.0)
```

The check is textual: `specifier` against manifest string. It is also the check that makes a
forgotten lockfile commit fail in two seconds instead of installing a different graph on CI
than on every laptop. Put `^7.5.0` back.

### Break 2 — regenerate the lockfile

```bash
cp pnpm-lock.yaml /tmp/lock.before
rm -rf pnpm-lock.yaml node_modules packages/*/node_modules
pnpm install
diff /tmp/lock.before pnpm-lock.yaml
pnpm build && pnpm demo
```

**Expect:** `web` now gets `semver 7.8.5`, three `packages` entries are gone, and the report
shows a single `semver` shared by `web` and the ESLint toolchain:

```
<         version: 7.5.4
>         version: 7.8.5
<   lru-cache@6.0.0:
<   semver@7.5.4:
<   yallist@4.0.0:

semver in the graph:
  semver@7.8.5   wanted by: importer packages/web, @typescript-eslint/typescript-estree@...
```

Nothing in `web`'s manifest changed. Its range was re-solved to the highest version on the
registry today, and two transitive packages left the graph with the old version. On a
two-package demo the diff is 24 lines; on a real repository it is several hundred versions,
none chosen, none reviewed together. **Deleting a lockfile does not fix a conflict. It replaces
a known graph with an unknown one.** Restore with:

```bash
cp /tmp/lock.before pnpm-lock.yaml
rm -rf node_modules packages/*/node_modules
pnpm install --frozen-lockfile && pnpm build && pnpm demo
```

> Two things observed while building this. Deleting *only* the lockfile, with `node_modules`
> still present, changes nothing: pnpm keeps a private copy at `node_modules/.pnpm/lock.yaml`
> and rebuilds the root file from it. And when a second importer pins the same package
> exactly (`api` declaring `semver 7.5.4`), a regenerated lockfile reuses that version for
> `web`'s range too, giving a zero-line diff. Both are reasons "I deleted it and it was fine"
> gets reported from laptops and never from CI.

## The rule to carry forward

> `package.json` is intent, the lockfile is fact. Commit the lockfile, let CI freeze it, update
> one entry at a time, and never regenerate it to make a conflict go away.

## References

- pnpm — [`pnpm install`](https://pnpm.io/cli/install) (`--frozen-lockfile`, CI default)
- pnpm — [Git merge conflicts in `pnpm-lock.yaml`](https://pnpm.io/git#merge-conflicts)
- pnpm — [`pnpm update`](https://pnpm.io/cli/update), [`pnpm dedupe`](https://pnpm.io/cli/dedupe),
  [`pnpm outdated`](https://pnpm.io/cli/outdated)
- pnpm — [`resolutionMode`](https://pnpm.io/settings#resolutionmode)

Verified on Node v24.18.0, pnpm 11.9.0, TypeScript 5.9.3.
