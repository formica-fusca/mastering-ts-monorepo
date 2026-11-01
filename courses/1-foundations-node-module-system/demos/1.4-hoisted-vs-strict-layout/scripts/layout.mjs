// Prints the on-disk layout that matters for the lesson: what sits directly in
// each node_modules that is on package `a`'s walk, and where symlinks point.
import { readdirSync, lstatSync, readlinkSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const show = (dir) => {
  const abs = join(root, dir)
  console.log(`${dir}/`)
  if (!existsSync(abs)) { console.log('  (does not exist)'); return }
  for (const name of readdirSync(abs).filter((n) => !n.startsWith('.')).sort()) {
    const p = join(abs, name)
    const link = lstatSync(p).isSymbolicLink() ? ` -> ${readlinkSync(p)}` : ''
    console.log(`  ${name}${link}`)
  }
}
// node_modules/.modules.yaml records the linker pnpm ACTUALLY used for this
// install — more honest than reading the setting, since a changed setting only
// takes effect after a reinstall.
const modulesYaml = join(root, 'node_modules/.modules.yaml')
const used = existsSync(modulesYaml) ? (readFileSync(modulesYaml, 'utf8').match(/"nodeLinker":\s*"(\w+)"/)?.[1] ?? 'unknown') : 'no install yet'
console.log(`node-linker used for this install: ${used}\n`)
show('packages/a/node_modules')
show('node_modules')
