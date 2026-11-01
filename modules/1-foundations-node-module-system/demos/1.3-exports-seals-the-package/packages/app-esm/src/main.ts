import { createRequire } from 'node:module'
import { load, entry, instance } from '@demo/config'
import { add } from '@demo/config/utils/math'
import pkg from '@demo/config/package.json' with { type: 'json' }

console.log('=== ESM consumer ===')
console.log('"." resolved to        :', entry)
console.log('"./utils/*" pattern     : add(2, 3) =', add(2, 3))
console.log('"./package.json"        : version', pkg.version)
console.log(load())

console.log('\n--- sealed: the physical path of the entry is NOT a public name ---')
// These specifiers are built from strings on purpose. Written literally,
// TypeScript (moduleResolution: nodenext) applies the SAME exports map and
// refuses them at compile time with TS2307 — try it. Node refuses at runtime.
const sealed = ['lib/index.js', 'internal-notes.js'].map((p) => `@demo/config/${p}`)
for (const specifier of sealed) {
  try {
    await import(specifier)
  } catch (e) {
    console.log(`import ${specifier} ->`, (e as NodeJS.ErrnoException).code)
  }
}

console.log('\n--- the dual package hazard, in one process ---')
const require = createRequire(import.meta.url)
const viaRequire = require('@demo/config') as typeof import('@demo/config')
console.log('import  gave :', entry)
console.log('require gave :', viaRequire.entry)
console.log('same instance?', instance === viaRequire.instance)
viaRequire.load()
console.log(`hits seen by import side: ${instance.hits}, by require side: ${viaRequire.instance.hits}`)
