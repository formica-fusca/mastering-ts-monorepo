import { createRequire } from 'node:module'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const tree = join(here, 'tree')
const require = createRequire(import.meta.url)
let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail && !ok ? `  (${detail})` : ''}`)
  if (!ok) failed++
}

console.log('\nExercise 1.2-a — predict the resolution\n')

// --- constraint: tree/ is untouched -----------------------------------------
const walk = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n)
  return statSync(p).isDirectory() ? walk(p) : [relative(tree, p).split(sep).join('/')]
})
const expectedTree = [
  'app/node_modules/greeter/lib/index.js', 'app/node_modules/greeter/package.json',
  'app/src/helpers/index.js', 'app/src/main.cjs', 'app/src/main.mjs',
  'node_modules/@scope/util/extra.js', 'node_modules/@scope/util/index.js',
  'node_modules/@scope/util/package.json', 'node_modules/greeter/index.js',
  'node_modules/greeter/package.json', 'packages/tool/index.cjs',
]
check('tree/ has not been modified', walk(tree).sort().join('\n') === expectedTree.join('\n'),
  'you are predicting, not editing — restore tree/ from git')

// --- what Node actually does -------------------------------------------------
const rel = (p) => (p === 'ERROR' ? 'ERROR' : relative(tree, p).split(sep).join('/'))
const cjsApp = require('./tree/app/src/main.cjs')
const esmApp = await import('./tree/app/src/main.mjs')
const tool = require('./tree/packages/tool/index.cjs')
const scoped = require('./tree/node_modules/@scope/util/index.js')
const actual = {
  1: rel(cjsApp.greeter),
  2: rel(tool.greeter),
  3: rel(cjsApp.helpers),
  4: esmApp.helpers === 'ERROR' ? 'ERROR' : 'app/src/helpers/index.js',
  5: rel(cjsApp.scopedSubpath),
  6: rel(scoped.greeterResolvedFromHere),
}

// --- your predictions ---------------------------------------------------------
const predictions = JSON.parse(readFileSync(join(here, 'predictions.json'), 'utf8'))
for (const [key, value] of Object.entries(predictions)) {
  if (key.startsWith('_')) continue
  const n = key.trim()[0]
  const guess = String(value).trim().replace(/^\.\//, '').replace(/^tree\//, '')
  const label = key.replace(/\s+/g, ' ').trim()
  if (guess === '') { check(label, false, 'no prediction written'); continue }
  check(label, guess === actual[n], `you predicted "${guess}", Node resolved "${actual[n]}"`)
}

console.log(failed === 0 ? '\n  All checks passed.\n' : `\n  ${failed} check(s) failing.\n`)
process.exit(failed === 0 ? 0 : 1)
