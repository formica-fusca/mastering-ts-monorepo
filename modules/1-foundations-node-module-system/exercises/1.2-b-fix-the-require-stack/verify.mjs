import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, lstatSync, readlinkSync, realpathSync } from 'node:fs'
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

console.log('\nExercise 1.2-b — fix the require stack\n')

// --- constraint: no existing file was edited --------------------------------
const frozen = {
  'app/main.cjs': '619092823350',
  'packages/lib/index.js': 'b4846de60ec4',
  'packages/lib/package.json': '8e4a53a40646',
  'app/node_modules/dep/index.js': 'd7e4a92874e6',
  'app/node_modules/dep/package.json': 'c62c42c3e706',
}
for (const [p, h] of Object.entries(frozen)) {
  let ok = false, detail = 'file missing'
  try { ok = sha(p) === h; detail = 'contents changed' } catch {}
  check(`${p} is unchanged`, ok, detail)
}
let linkOk = false
try {
  const link = join(tree, 'app/node_modules/@demo/lib')
  linkOk = lstatSync(link).isSymbolicLink() && readlinkSync(link) === '../../../packages/lib'
} catch {}
check('app/node_modules/@demo/lib is still the original symlink', linkOk,
  'replacing the symlink with a copy is not the fix')

// --- goal: plain `node app/main.cjs`, no flags, no NODE_PATH ------------------
const env = { ...process.env }
delete env.NODE_PATH
delete env.NODE_OPTIONS
const run = spawnSync(process.execPath, ['app/main.cjs'], { cwd: tree, env, encoding: 'utf8' })
check('node app/main.cjs exits 0', run.status === 0,
  (run.stderr.split('\n').find((l) => l.startsWith('Error:')) ?? 'non-zero exit'))
check('it prints HELLO FROM LIB', run.stdout.trim() === 'HELLO FROM LIB', `got "${run.stdout.trim()}"`)

// --- and the fix is where the library will actually find it -------------------
let from = 'ERROR'
try { from = createRequire(join(tree, 'packages/lib/index.js')).resolve('dep') } catch {}
check('`dep` resolves from packages/lib/index.js (its REAL location)', from !== 'ERROR')
if (from !== 'ERROR') {
  const real = realpathSync(from)
  console.log(`\n  dep resolved to: ${real.replace(tree, 'tree')}`)
}

console.log(failed === 0 ? '\n  All checks passed.\n' : `\n  ${failed} check(s) failing.\n`)
process.exit(failed === 0 ? 0 : 1)
