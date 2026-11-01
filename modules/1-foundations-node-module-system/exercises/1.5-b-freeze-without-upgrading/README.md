# 1.5-b — Freeze without upgrading

**From:** lesson 1.5, lockfiles and deterministic installs. Do [1.5-a](../1.5-a-read-the-lockfile/) first.

> **This exercise runs pnpm.** It is the first in the repo that does. The verifier copies
> `tree/` to a temp directory and runs `pnpm install --frozen-lockfile` there, because
> nothing else can tell you whether CI would accept the lockfile. `tree/` itself is never
> installed into.

## Goal

A teammate "cleaned up" the version ranges in three manifests and did not touch the
lockfile. CI is red:

```
[ERR_PNPM_OUTDATED_LOCKFILE] Cannot install with "frozen-lockfile" ...
```

Make `pnpm install --frozen-lockfile` pass **without upgrading anything**. The three locked
versions, `typescript 5.9.3`, `semver 7.5.4`, `is-odd 3.0.1`, must still be the versions
installed afterwards, and every integrity hash must stay as it is.

```
tree/
  package.json                devDependencies: typescript ^5.9.0     (lockfile says 5.9.3)
  packages/web/package.json   dependencies:    semver ^7.6.0         (lockfile says ^7.5.0 -> 7.5.4)
  packages/api/package.json   dependencies:    is-odd ^3.0.0         (lockfile says 3.0.1)
  pnpm-lock.yaml
```

## The constraints

1. **No version moves.** The verifier reads the `version:` lines under `importers` and fails
   if any of the three changed.
2. **The lockfile may change only in its `specifier:` lines.** Everything else, `packages`,
   `snapshots`, every integrity hash, is hashed and compared.
3. Which file you edit to reconcile each pair is your call. There are two legitimate
   directions, and one of the three pairs admits only one of them.

## Verify

```bash
node verify.mjs
```

Four checks guard the constraints, one compares every specifier against its manifest and
lists the mismatches, one runs the real frozen install.

## Hints

<details>
<summary>Hint 1 — what the frozen check actually compares</summary>

Text. `specifier` in the lockfile against the string in the manifest. `^3.0.0` and `3.0.1`
are different strings, so the install fails even though `3.0.1` satisfies `^3.0.0`. Nothing
about the locked *version* is wrong here.
</details>

<details>
<summary>Hint 2 — the two directions</summary>

Either make the manifest say what the lockfile says, or make the lockfile's `specifier` line
say what the manifest says. The second is what `pnpm install` without `--frozen-lockfile`
would do automatically **if** the locked version satisfies the new range. For which of the
three pairs is that not the case, and what would pnpm do there instead?
</details>

<details>
<summary>Hint 3 — if you ran plain pnpm install and a check went red</summary>

Look at which `version:` moved. pnpm resolved a range the locked version could not satisfy,
to the highest version on the registry today. That is the upgrade the exercise forbids, and
it is the same thing the lesson's check-in question was about.
</details>

## What this is really testing

That you can repair the intent/fact pair deliberately: knowing what the frozen check reads,
knowing which direction preserves the known-good graph, and recognising that the "easy fix"
of a plain `pnpm install` silently upgrades the one dependency whose range no longer covers
its locked version.
