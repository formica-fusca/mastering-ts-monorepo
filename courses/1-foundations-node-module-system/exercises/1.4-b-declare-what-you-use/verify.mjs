import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const tree = join(here, 'tree')
let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail && !ok ? `  (${detail})` : ''}`)
  if (!ok) failed++
}
const sha = (p) => createHash('sha256').update(readFileSync(join(tree, p))).digest('hex').slice(0, 12)

console.log('\nExercise 1.4-b — declare what you use\n')

// --- constraints -------------------------------------------------------------------
check('packages/api/index.js is unchanged', sha('packages/api/index.js') === '80fc639a02c4', 'the code is not the bug')
check('root package.json is unchanged (tooling only)', sha('package.json') === '37ce640204e7',
  'declaring at the root is hoisting by hand — it hides the bug, it does not fix it')
check('packages/web/package.json is unchanged', sha('packages/web/package.json') === '2078d6f0c70c')
check('node_modules/ is unchanged (you are not the package manager)',
  ['lint-tool', 'left-pad', 'chalk', 'ms'].every((n) => existsSync(join(tree, 'node_modules', n))) &&
  !existsSync(join(tree, 'packages/api/node_modules')), 'edit packages/api/package.json only')

// --- it still works in the hoisted workspace, of course ---------------------------------
const env = { ...process.env }; delete env.NODE_PATH; delete env.NODE_OPTIONS
const inWorkspace = spawnSync(process.execPath, ['packages/api/index.js'], { cwd: tree, env, encoding: 'utf8' })
check('in the hoisted workspace, api runs (it always did)', inWorkspace.status === 0 && inWorkspace.stdout.trim() === '**    api up** in 42ms')

// --- the real test: install api ALONE, with exactly what it declares -----------------------
// A tiny package manager: for each declared dependency, find an installed copy
// whose version satisfies the spec (exact, or ^ / ~ with the same major) and
// link it into a fresh node_modules next to a copy of api. Nothing else.
const api = JSON.parse(readFileSync(join(tree, 'packages/api/package.json'), 'utf8'))
const declared = { ...(api.dependencies ?? {}) }
const installed = []
for (const dir of ['node_modules', ...readdirSync(join(tree, 'packages')).map((p) => `packages/${p}/node_modules`)]) {
  if (!existsSync(join(tree, dir))) continue
  for (const name of readdirSync(join(tree, dir)).filter((n) => !n.startsWith('.'))) {
    const pj = join(tree, dir, name, 'package.json')
    if (existsSync(pj)) installed.push({ name, version: JSON.parse(readFileSync(pj, 'utf8')).version, dir: join(tree, dir, name) })
  }
}
const satisfies = (spec, version) => {
  const m = /^([\^~=]?)v?(\d+)(?:\.(\d+))?(?:\.(\d+))?$/.exec(String(spec).trim())
  if (!m) return false
  const [, op, maj, min, pat] = m
  const [vMaj, vMin, vPat] = version.split('.').map(Number)
  if (Number(maj) !== vMaj) return false
  if (op === '^') return min === undefined || vMin > Number(min) || (vMin === Number(min) && vPat >= Number(pat ?? 0))
  if (op === '~') return min === undefined || (vMin === Number(min) && vPat >= Number(pat ?? 0))
  return (min === undefined || vMin === Number(min)) && (pat === undefined || vPat === Number(pat))
}
const solo = join(tmpdir(), `exercise-1.4-b-${process.pid}`)
rmSync(solo, { recursive: true, force: true })
mkdirSync(join(solo, 'api/node_modules'), { recursive: true })
cpSync(join(tree, 'packages/api/index.js'), join(solo, 'api/index.js'))
cpSync(join(tree, 'packages/api/package.json'), join(solo, 'api/package.json'))
let installOk = true
for (const [name, spec] of Object.entries(declared)) {
  const copy = installed.find((c) => c.name === name && satisfies(spec, c.version))
  if (!copy) {
    installOk = false
    const seen = installed.filter((c) => c.name === name).map((c) => c.version).join(', ') || 'none'
    check(`declared ${name}@${spec} can be installed`, false, `no installed copy satisfies it; versions on disk: ${seen}`)
    continue
  }
  cpSync(copy.dir, join(solo, 'api/node_modules', name), { recursive: true })
}
if (installOk) {
  const run = spawnSync(process.execPath, ['index.js'], { cwd: join(solo, 'api'), env, encoding: 'utf8' })
  const err = run.stderr.split('\n').find((l) => l.startsWith('Error:')) ?? ''
  check(`installed ALONE with only its declared deps [${Object.keys(declared).join(', ')}], api runs`,
    run.status === 0, err || `exit ${run.status}`)
  check('and prints the same output', run.stdout.trim() === '**    api up** in 42ms', `got "${run.stdout.trim()}"`)
}
rmSync(solo, { recursive: true, force: true })

console.log(failed === 0 ? '\n  All checks passed.\n' : `\n  ${failed} check(s) failing.\n`)
process.exit(failed === 0 ? 0 : 1)
