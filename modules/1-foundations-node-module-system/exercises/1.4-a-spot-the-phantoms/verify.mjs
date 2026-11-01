import { createRequire } from 'node:module'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const tree = join(here, 'tree')
let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail && !ok ? `  (${detail})` : ''}`)
  if (!ok) failed++
}

console.log('\nExercise 1.4-a — spot the phantoms\n')

// --- constraint: tree/ untouched -------------------------------------------------
const walk = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n)
  return statSync(p).isDirectory() ? walk(p) : [relative(tree, p).split(sep).join('/')]
})
const expected = [
  'node_modules/chalk/index.js', 'node_modules/chalk/package.json', 'node_modules/left-pad/index.js',
  'node_modules/left-pad/package.json', 'node_modules/lint-tool/index.js', 'node_modules/lint-tool/package.json',
  'node_modules/ms/index.js', 'node_modules/ms/package.json', 'package.json',
  'packages/api/index.js', 'packages/api/node_modules/left-pad/index.js', 'packages/api/node_modules/left-pad/package.json',
  'packages/api/package.json', 'packages/shared/index.js', 'packages/shared/package.json',
  'packages/web/index.js', 'packages/web/package.json',
]
check('tree/ has not been modified', walk(tree).sort().join('\n') === expected.join('\n'), 'restore tree/ from git')

// --- what Node does, and what each package.json says ------------------------------
const classify = (pkgDir, spec) => {
  const pkgJson = JSON.parse(readFileSync(join(tree, pkgDir, 'package.json'), 'utf8'))
  const declared = Object.hasOwn(pkgJson.dependencies ?? {}, spec) || Object.hasOwn(pkgJson.devDependencies ?? {}, spec)
  const req = createRequire(join(tree, pkgDir, 'index.js'))
  try {
    const version = req(`${spec}/package.json`).version
    return `${declared ? 'declared' : 'phantom'} ${version}`
  } catch {
    return 'unreachable ERROR'
  }
}
const cases = {
  1: ['packages/web', 'left-pad'], 2: ['packages/api', 'left-pad'], 3: ['packages/api', 'chalk'],
  4: ['packages/shared', 'ms'], 5: ['packages/shared', 'lint-tool'], 6: ['packages/web', 'ms'], 7: ['packages/api', 'nope'],
}

// --- your predictions --------------------------------------------------------------
const predictions = JSON.parse(readFileSync(join(here, 'predictions.json'), 'utf8'))
for (const [key, value] of Object.entries(predictions)) {
  if (key.startsWith('_')) continue
  const n = key.trim()[0]
  const label = key.replace(/\s+/g, ' ').trim()
  const guess = String(value).trim().replace(/\s+/g, ' ').toLowerCase()
  if (!guess) { check(label, false, 'no prediction written'); continue }
  const actual = classify(...cases[n]).toLowerCase()
  check(label, guess === actual, `you predicted "${guess}", Node + package.json say "${actual}"`)
}

console.log(failed === 0 ? '\n  All checks passed.\n' : `\n  ${failed} check(s) failing.\n`)
process.exit(failed === 0 ? 0 : 1)
