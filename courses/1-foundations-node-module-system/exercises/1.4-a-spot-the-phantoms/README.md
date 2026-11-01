# 1.4-a — Spot the phantoms

**From:** lesson 1.4, hoisting and phantom dependencies.

## Goal

`tree/` is a **hoisted** workspace layout, the kind npm or `nodeLinker: hoisted` produces,
frozen on disk. Three workspace packages, four third-party packages, one version conflict.

```
tree/
  package.json                  devDependencies: lint-tool 1.0.0
  node_modules/
    lint-tool/  1.0.0
    left-pad/   2.0.0
    chalk/      5.0.0           depends on ms ^3.0.0
    ms/         3.0.0
  packages/
    web/        dependencies: left-pad 2.0.0, chalk 5.0.0
    api/        dependencies: left-pad 1.0.0
      node_modules/left-pad/  1.0.0
    shared/     dependencies: (none)
```

For each of the seven imports in `predictions.json`, write **what Node does** and **what the
importer's `package.json` says about it**, as `<status> <version>`:

- `declared 2.0.0` — the importer lists the package, and this is the version loaded
- `phantom 3.0.0` — reachable, loaded at this version, but the importer never declared it
- `unreachable ERROR` — resolution fails

`predictions.json` is the only file to edit.

## The constraint

**Predict all seven before running anything in `tree/`.** The verifier cannot enforce that;
it is the whole exercise. Do not modify `tree/`.

## Verify

```bash
node verify.mjs
```

One check guards the tree, seven compare your predictions with what Node resolved and what
the manifests declare.

## Hints

<details>
<summary>Hint 1 — two questions per import, in this order</summary>

First the 1.2 question: from this package's directory, which is the nearest
`node_modules/<name>` going up? That gives the version. Then the 1.4 question: does this
package's own `package.json` list that name? That gives the status. The two questions have
nothing to do with each other, which is the point.
</details>

<details>
<summary>Hint 2 — case 2 and case 5</summary>

Case 2 has two copies in play; the nearest wins, as always. Case 5 is a root `devDependency`.
The root's manifest is not `shared`'s manifest. "It is at the root so everyone has it" is a
sentence about the layout, not about what `shared` declared.
</details>

<details>
<summary>Hint 3 — case 4</summary>

`ms` is a dependency of `chalk`, which is a dependency of `web`. `shared` declares neither.
Two hops of borrowing, and it works. Ask yourself which of the three packages has the power to
make it stop working, and whether `shared` would appear in that diff.
</details>

## What this is really testing

Whether you can read a hoisted layout and separate the two layers that hoisting fuses: what
is **reachable** (Node's walk over the directories) and what is **declared** (the manifest).
Every phantom bug is a gap between those two lists, and in a hoisted layout nothing on the
machine will show you the gap unless you look for it.
