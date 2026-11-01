# 1.3-a — Write the exports map

**From:** lesson 1.3, `package.json` anatomy.

## Goal

`tree/node_modules/toolkit` is a package with no `exports` field. Every file in it is
reachable by path, including `lib/internal/secrets.js`. Give it an `exports` map so that:

**These resolve**

| Specifier | Must load |
|---|---|
| `import 'toolkit'` | `lib/index.js` |
| `require('toolkit')` | `lib/index.cjs` |
| `import 'toolkit/plugins/auth'` | `lib/plugins/auth.js` |
| `import 'toolkit/plugins/cache'` | `lib/plugins/cache.js` |
| `import 'toolkit/package.json'` | `package.json` |

**These are refused** (any error is fine, but you should be able to predict which)

- `toolkit/lib/index.js` — the physical path of the entry
- `toolkit/lib/internal/secrets.js` and `toolkit/internal/secrets`
- `toolkit/plugins/auth.js` — the extension is not part of the public name

`tree/node_modules/toolkit/package.json` is the only file to edit.

## The constraints

1. **No file may be added, moved, or removed.** The map has to fit the tree as it is.
2. **`main` stays** at `./lib/index.cjs`, for tooling that predates `exports`.
3. **`types` is the first condition** under `"."`, and `default`, if you use one, is last.
   The verifier reads the key order of your JSON.

## Verify

```bash
node verify.mjs
```

Two checks guard the tree, four check the shape of the map, five check what must resolve,
four check what must be refused.

## Hints

<details>
<summary>Hint 1 — two levels, two jobs</summary>

Keys starting with `.` name **public subpaths**. Inside a subpath, keys that do not start
with `.` are **conditions** choosing a file for that subpath. Decide the list of public
names first; only then decide which file each one maps to.
</details>

<details>
<summary>Hint 2 — the plugins</summary>

Two plugins is few enough to list by hand, but the refused case `toolkit/plugins/auth.js`
is telling you something about how a pattern target should end. Lesson 1.3: the `*` is
textual substitution.
</details>

<details>
<summary>Hint 3 — what seals and what does not</summary>

Adding `exports` at all is what refuses `lib/index.js` and the internals. You do not list
things to forbid; you list things to allow, and everything else becomes unreachable. Then
re-read the "must resolve" table and ask what else a sealed package has to allow explicitly.
</details>

## What this is really testing

Whether you can design a package's public surface on purpose: name the entry points, serve
the right file to each kind of consumer, keep the manifest readable, and make everything
else unreachable, without touching a single source file.
