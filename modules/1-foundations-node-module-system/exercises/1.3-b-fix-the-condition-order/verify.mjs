import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const tree = join(here, 'tree')
const pkgDir = join(tree, 'node_modules/shape')
let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail && !ok ? `  (${detail})` : ''}`)
  if (!ok) failed++
}
const sha = (p) => createHash('sha256').update(readFileSync(join(pkgDir, p))).digest('hex').slice(0, 12)

console.log('\nExercise 1.3-b — fix the condition order\n')

// --- constraint: reorder ONLY -------------------------------------------------------
const frozen = {
  'lib/legacy.cjs': '93fa3a2faebb', 'lib/index.js': 'a8ae1b8ea51d', 'lib/index.dev.js': 'c4dfc3458645',
  'lib/index.cjs': '03aaf91c4bab', 'lib/index.d.ts': '6dc5c1df3cfc',
}
check('shape/lib/** is unchanged', Object.entries(frozen).every(([p, h]) => { try { return sha(p) === h } catch { return false } }))
let pkg = {}
try { pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')) } catch { check('package.json is valid JSON', false) }
const original = {
  default: './lib/legacy.cjs', import: './lib/index.js', development: './lib/index.dev.js',
  require: './lib/index.cjs', types: './lib/index.d.ts',
}
const root = pkg.exports?.['.'] ?? {}
const sameEntries = JSON.stringify(Object.entries(root).sort()) === JSON.stringify(Object.entries(original).sort())
check('exports["."] has exactly the original five entries (reordered, not rewritten)', sameEntries,
  'you may change the ORDER of the conditions, nothing else')
const rest = { ...pkg }; delete rest.exports
check('nothing else in package.json changed',
  JSON.stringify(rest) === JSON.stringify({ name: 'shape', version: '3.1.0', type: 'module' }) && Object.keys(pkg.exports ?? {}).join() === '.')

// --- shape rule TypeScript relies on ----------------------------------------------
const keys = Object.keys(root)
check('"types" is the first condition', keys[0] === 'types', `first key is "${keys[0]}"`)

// --- behaviour, observed by running Node from inside tree/ -------------------------
const env = { ...process.env }; delete env.NODE_OPTIONS
const run = (args) => {
  const r = spawnSync(process.execPath, args, { cwd: tree, env, encoding: 'utf8' })
  return r.status === 0 ? r.stdout.trim() : (r.stderr.split('\n').find((l) => l.includes('Error')) ?? 'exit ' + r.status)
}
const ESM = ['--input-type=module', '-e', "import { which } from 'shape'; console.log(which)"]
const CJS = ['-e', "console.log(require('shape').which)"]
const cases = [
  ['import  (no flags)            → lib/index.js', ESM, 'lib/index.js'],
  ['require (no flags)            → lib/index.cjs', CJS, 'lib/index.cjs'],
  ['import  --conditions=development → lib/index.dev.js', ['--conditions=development', ...ESM], 'lib/index.dev.js'],
  ['require --conditions=development → lib/index.dev.js', ['--conditions=development', ...CJS], 'lib/index.dev.js'],
]
for (const [label, args, want] of cases) {
  const got = run(args)
  check(label, got === want, `got ${got}`)
}

console.log(failed === 0 ? '\n  All checks passed.\n' : `\n  ${failed} check(s) failing.\n`)
process.exit(failed === 0 ? 0 : 1)
