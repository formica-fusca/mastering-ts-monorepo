import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const tree = join(here, 'tree')
let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail && !ok ? `  (${detail})` : ''}`)
  if (!ok) failed++
}
const sha = (p) => createHash('sha256').update(readFileSync(join(tree, p))).digest('hex').slice(0, 12)

console.log('\nExercise 1.5-a — read the lockfile\n')

// --- constraint: the tree is frozen ----------------------------------------------
check('tree/ is unchanged', sha('pnpm-lock.yaml') === 'afd73720370d' && sha('package.json') === '558da4a70c40' &&
  sha('packages/web/package.json') === 'b50a20d52150' && sha('packages/api/package.json') === 'dc088a6b290b',
  'restore tree/ from git — you are reading, not editing')

// --- answers, as the lockfile has them -----------------------------------------------
const answers = {
  1: '7.5.4',
  2: '6.3.1',
  3: '2',
  4: 'web',
  5: 'lru-cache@6.0.0, semver@7.5.4, yallist@4.0.0',
  6: 'api/semver, web/semver',
  7: 'no',
  8: '6.3.1',
}
const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim().split(',').map((x) => x.trim()).filter(Boolean).sort().join(', ')

const predictions = JSON.parse(readFileSync(join(here, 'predictions.json'), 'utf8'))
for (const [key, value] of Object.entries(predictions)) {
  if (key.startsWith('_')) continue
  const n = key.trim()[0]
  const label = key.replace(/\s+/g, ' ').trim()
  if (!String(value).trim()) { check(label, false, 'no answer written'); continue }
  check(label, norm(value) === norm(answers[n]), `you wrote "${value}", the lockfile says "${answers[n]}"`)
}

console.log(failed === 0 ? '\n  All checks passed.\n' : `\n  ${failed} check(s) failing.\n`)
process.exit(failed === 0 ? 0 : 1)
