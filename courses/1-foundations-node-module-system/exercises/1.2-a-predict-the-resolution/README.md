# 1.2-a — Predict the resolution

**From:** lesson 1.2, the `node_modules` resolution algorithm.

## Goal

Six specifiers, three importer locations, one small tree. **Before running anything**, write
down in `predictions.json` the file each one resolves to (relative to `tree/`), or `ERROR`.
Then run the verifier and compare.

```
tree/
  node_modules/
    greeter/              main: index.js
    @scope/util/          main: index.js, also has extra.js, and itself requires 'greeter'
  app/
    node_modules/greeter/ main: lib/index.js       <- a SECOND greeter, closer to app
    src/
      main.cjs            require('greeter'), require('./helpers'), require('@scope/util/extra')
      main.mjs            import('./helpers')
      helpers/index.js
  packages/tool/
    index.cjs             require('greeter')
```

`predictions.json` is the only file to edit.

## The constraint

**Do not run Node inside `tree/` until all six predictions are written.** The verifier cannot
enforce that, so this one is on you. The exercise measures whether you can run the algorithm
in your head; running it on the machine first measures nothing.

Do not modify `tree/`. The verifier checks that.

## Verify

```bash
node verify.mjs
```

One check guards the tree, six compare your predictions with what Node actually resolved.
A wrong prediction prints both values. If you got one wrong, do not just fix the JSON: trace
the walk by hand until you can say *why* Node chose what it chose.

## Hints

<details>
<summary>Hint 1 — the two questions to ask for every bare specifier</summary>

Where does the importing file live? From there, which is the **first** directory going
upward that has a `node_modules/<name>`? The nearest copy wins, always, even if a "better"
one exists higher up.
</details>

<details>
<summary>Hint 2 — case 6 is the one people miss</summary>

`node_modules/@scope/util/index.js` requires `greeter`. It does not know or care that an
`app/` directory exists somewhere with its own `greeter`. The walk goes **up** from the
importer, never sideways or down.
</details>

<details>
<summary>Hint 3 — case 4 vs case 3</summary>

Same directory, same relative specifier, two resolvers. One of them probes for `index.js`
inside a directory. The other treats the specifier as a URL and refuses to guess.
</details>

## What this is really testing

That you can run `NODE_MODULES_PATHS` and `LOAD_AS_DIRECTORY` mentally, and that you know
which of the two resolvers you are dealing with. That is the whole of 1.2, and it is the
skill that reads a `Cannot find module` error correctly on the first try.
