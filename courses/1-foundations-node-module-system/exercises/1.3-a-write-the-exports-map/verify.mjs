import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const tree = join(here, 'tree')
const pkgDir = join(tree, 'node_modules/toolkit')
let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail && !ok ? `  (${detail})` : ''}`)
  if (!ok) failed++
}
const sha = (p) => createHash('sha256').update(readFileSync(join(pkgDir, p))).digest('hex').slice(0, 12)

console.log('\nExercise 1.3-a — write the exports map\n')

// --- constraint: only package.json changed -------------------------------------
const walk = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n)
  return statSync(p).isDirectory() ? walk(p) : [relative(pkgDir, p).split(sep).join('/')]
})
const frozen = {
  'lib/index.cjs': '03aaf91c4bab', 'lib/index.d.ts': '6dc5c1df3cfc', 'lib/index.js': 'a8ae1b8ea51d',
  'lib/internal/secrets.js': 'fe02da23c337', 'lib/plugins/auth.js': '62ab3039169d', 'lib/plugins/cache.js': '0e6ffdef4c1f',
}
check('toolkit/ contains only the original files', walk(pkgDir).sort().join(',') === [...Object.keys(frozen), 'package.json'].sort().join(','),
  'no files may be added, moved or removed — the map must fit the tree as it is')
check('toolkit/lib/** is unchanged', Object.entries(frozen).every(([p, h]) => { try { return sha(p) === h } catch { return false } }))

// --- shape rules --------------------------------------------------------------
let pkg = {}
try { pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')) } catch { check('package.json is valid JSON', false); }
check('"main" still points at ./lib/index.cjs (fallback for old tooling)', pkg.main === './lib/index.cjs')
check('"exports" is present', typeof pkg.exports === 'object' && pkg.exports !== null, 'no exports field — nothing is sealed')
const root = pkg.exports?.['.']
const rootKeys = root && typeof root === 'object' ? Object.keys(root) : []
check('exports["."] is a conditions object with "types" FIRST', rootKeys[0] === 'types',
  rootKeys.length ? `first key is "${rootKeys[0]}"` : 'exports["."] is not a conditions object')
check('"default", if present, is LAST', !rootKeys.includes('default') || rootKeys.at(-1) === 'default')

// --- behaviour: must resolve ----------------------------------------------------
const { esm, cjs } = await import('./tree/probe.mjs')
const relPkg = (s) => s.replace('file://', '').replace(pkgDir + '/', '')
const must = [
  ["import 'toolkit'", () => esm('toolkit'), 'lib/index.js'],
  ["require('toolkit')", () => cjs('toolkit'), 'lib/index.cjs'],
  ["import 'toolkit/plugins/auth'", () => esm('toolkit/plugins/auth'), 'lib/plugins/auth.js'],
  ["import 'toolkit/plugins/cache'", () => esm('toolkit/plugins/cache'), 'lib/plugins/cache.js'],
  ["import 'toolkit/package.json'", () => esm('toolkit/package.json'), 'package.json'],
]
for (const [label, fn, want] of must) {
  let got
  try { got = relPkg(await fn()) } catch (e) { got = e.code }
  check(`${label} → ${want}`, got === want, `got ${got}`)
}

// --- behaviour: must be refused -------------------------------------------------
const refused = [
  ["import 'toolkit/lib/index.js'  (physical path of the entry)", () => esm('toolkit/lib/index.js')],
  ["import 'toolkit/lib/internal/secrets.js'", () => esm('toolkit/lib/internal/secrets.js')],
  ["import 'toolkit/internal/secrets'", () => esm('toolkit/internal/secrets')],
  ["import 'toolkit/plugins/auth.js'  (extension is not part of the public name)", () => esm('toolkit/plugins/auth.js')],
]
for (const [label, fn] of refused) {
  let code = null
  try { await fn() } catch (e) { code = e.code }
  check(`${label} is refused`, code !== null, 'it resolved — the package is not sealed here')
}

console.log(failed === 0 ? '\n  All checks passed.\n' : `\n  ${failed} check(s) failing.\n`)
process.exit(failed === 0 ? 0 : 1)
