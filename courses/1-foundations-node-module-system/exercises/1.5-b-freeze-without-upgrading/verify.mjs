import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readFileSync, cpSync, rmSync, mkdtempSync } from 'node:fs'
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

console.log('\nExercise 1.5-b — freeze without upgrading\n')

// --- read the lockfile's importers with a tiny indentation parser ----------------------
const lock = readFileSync(join(tree, 'pnpm-lock.yaml'), 'utf8')
const importers = {}
let section = null, imp = null, dep = null
for (const line of lock.split('\n')) {
  if (/^\S/.test(line)) { section = line.replace(':', '').trim(); continue }
  if (section !== 'importers') continue
  let m
  if ((m = /^  (\S.*):$/.exec(line))) { imp = m[1]; importers[imp] = {}; continue }
  if ((m = /^      (\S.*):$/.exec(line))) { dep = m[1]; importers[imp][dep] = {}; continue }
  if ((m = /^        (specifier|version): (.*)$/.exec(line))) importers[imp][dep][m[1]] = m[2].trim()
}

// --- constraint: nothing upgraded -----------------------------------------------------------
const lockedVersions = { '.': { typescript: '5.9.3' }, 'packages/web': { semver: '7.5.4' }, 'packages/api': { 'is-odd': '3.0.1' } }
for (const [i, deps] of Object.entries(lockedVersions))
  for (const [name, v] of Object.entries(deps))
    check(`${i}: ${name} is still locked at ${v}`, importers[i]?.[name]?.version === v,
      `now ${importers[i]?.[name]?.version ?? 'missing'} — that is an upgrade, not a fix`)
const withoutSpecifiers = lock.split('\n').filter((l) => !/^\s+specifier: /.test(l)).join('\n')
check('lockfile unchanged apart from specifier lines (packages, snapshots, integrity intact)',
  createHash('sha256').update(withoutSpecifiers).digest('hex').slice(0, 12) === 'a42b5c678f69',
  'regenerating the lockfile is exactly what the exercise forbids')

// --- the goal: specifiers agree, and pnpm agrees that they agree ------------------------------
const manifestFor = (i) => JSON.parse(readFileSync(join(tree, i === '.' ? 'package.json' : `${i}/package.json`), 'utf8'))
const mismatches = []
for (const [i, deps] of Object.entries(importers)) {
  const man = manifestFor(i)
  const declared = { ...(man.dependencies ?? {}), ...(man.devDependencies ?? {}) }
  for (const [name, { specifier }] of Object.entries(deps))
    if (declared[name] !== specifier) mismatches.push(`${i}/${name}: lockfile "${specifier}", manifest "${declared[name] ?? 'missing'}"`)
}
check('every specifier in the lockfile matches its manifest', mismatches.length === 0, mismatches.join('; '))

const pnpm = spawnSync('pnpm', ['--version'], { encoding: 'utf8' })
if (pnpm.status !== 0) {
  check('pnpm is available on PATH', false, 'this exercise needs pnpm to run the frozen install')
} else {
  const tmp = mkdtempSync(join(tmpdir(), 'exercise-1.5-b-'))
  cpSync(tree, tmp, { recursive: true, filter: (src) => !src.includes('node_modules') })
  const env = { ...process.env, CI: 'true' }
  const run = spawnSync('pnpm', ['install', '--frozen-lockfile', '--ignore-scripts'], { cwd: tmp, env, encoding: 'utf8' })
  const err = (run.stdout + run.stderr).split('\n').filter((l) => /ERR_|mismatched|^\s+- /.test(l)).join(' | ')
  check(`pnpm install --frozen-lockfile passes (pnpm ${pnpm.stdout.trim()}, CI=true, fresh copy)`, run.status === 0, err || `exit ${run.status}`)
  rmSync(tmp, { recursive: true, force: true })
}

console.log(failed === 0 ? '\n  All checks passed.\n' : `\n  ${failed} check(s) failing.\n`)
process.exit(failed === 0 ? 0 : 1)
