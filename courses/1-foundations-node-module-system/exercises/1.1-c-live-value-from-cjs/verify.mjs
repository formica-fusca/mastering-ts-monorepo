import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'

const require = createRequire(import.meta.url)
let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail && !ok ? `  (${detail})` : ''}`)
  if (!ok) failed++
}

console.log('\nExercise 1.1-c — observing a live value from CJS\n')

// --- constraint: the package must still be CommonJS ------------------------
const src = require('node:fs').readFileSync(new URL('./counter.cjs', import.meta.url), 'utf8')
check('counter.cjs contains no ESM export syntax',
  !/^\s*export\s/m.test(src), 'found `export` — the package was converted to ESM')

// --- goal: module.exports must expose a LIVE value -------------------------
const mod = require('./counter.cjs')
const before = mod.count
mod.inc()
const after = mod.count
check('module.exports.count reflects the increment',
  before === 0 && after === 1, `before=${before} after=${after}`)

// --- goal: the consumer must actually print 0 then 1 -----------------------
let out = ''
try {
  out = execFileSync(process.execPath, ['consumer.mjs'], {
    cwd: new URL('.', import.meta.url), encoding: 'utf8',
  })
} catch (err) {
  out = `${err.stdout ?? ''}${err.stderr ?? ''}`
}
check('consumer.mjs prints "before inc(): 0"', /before inc\(\):\s*0/.test(out))
check('consumer.mjs prints "after  inc(): 1"', /after\s+inc\(\):\s*1/.test(out),
  'still reading a stale value — which import form are you using?')

console.log(failed === 0 ? '\n  All checks passed.\n' : `\n  ${failed} check(s) failing.\n`)
process.exit(failed === 0 ? 0 : 1)
