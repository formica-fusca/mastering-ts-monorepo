// Reads pnpm-lock.yaml and prints what it pins, per workspace package.
// A specifier that is a RANGE is one a fresh resolution (no lockfile) could move.
import { readFileSync } from 'node:fs'
import { parse } from 'yaml'

const lock = parse(readFileSync('pnpm-lock.yaml', 'utf8'))
const isExact = (spec) => /^\d+\.\d+\.\d+$/.test(spec) || spec.startsWith('workspace:')

console.log(`=== pnpm-lock.yaml  (lockfileVersion ${lock.lockfileVersion}) ===\n`)
for (const [importer, sections] of Object.entries(lock.importers)) {
  console.log(`importer ${importer === '.' ? '. (workspace root)' : importer}`)
  for (const [kind, deps] of Object.entries(sections)) {
    for (const [name, { specifier, version }] of Object.entries(deps)) {
      const tag = isExact(specifier) ? 'pinned by manifest' : 'RANGE — pinned only by this lockfile'
      console.log(`  ${kind.padEnd(16)} ${name.padEnd(20)} ${specifier.padEnd(12)} -> ${version.padEnd(10)} ${tag}`)
    }
  }
}
const pkgs = Object.keys(lock.packages)
const withIntegrity = pkgs.filter((k) => lock.packages[k].resolution?.integrity).length
console.log(`\npackages  : ${pkgs.length} distinct name@version entries, ${withIntegrity} with an integrity hash`)
console.log(`snapshots : ${Object.keys(lock.snapshots).length} graph nodes`)
// Who depends on which semver? Two versions can coexist because different
// consumers asked for different ranges; each resolved independently.
const dependents = (key) => {
  const out = []
  for (const [imp, sections] of Object.entries(lock.importers))
    for (const deps of Object.values(sections))
      for (const [name, { version }] of Object.entries(deps)) if (`${name}@${version}` === key) out.push(`importer ${imp}`)
  for (const [snap, body] of Object.entries(lock.snapshots))
    for (const [name, version] of Object.entries(body.dependencies ?? {})) if (`${name}@${version}` === key) out.push(snap)
  return out
}
console.log('\nsemver in the graph:')
for (const key of pkgs.filter((k) => k.startsWith('semver@')))
  console.log(`  ${key.padEnd(14)} wanted by: ${dependents(key).join(', ')}`)
console.log(`layout settings in the lockfile: ${JSON.stringify(lock.settings)}  (no nodeLinker — the layout is not pinned here)\n`)
