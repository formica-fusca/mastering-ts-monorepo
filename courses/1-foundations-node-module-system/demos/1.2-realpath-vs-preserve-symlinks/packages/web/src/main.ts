import dep = require('dep')
import lib = require('@demo/lib')

const root = process.cwd()
const rel = (p: string) => p.replace(root, '<root>')
const mode = process.execArgv.includes('--preserve-symlinks') ? 'preserve-symlinks' : 'default (realpath)'

console.log(`=== mode: ${mode} ===\n`)

console.log('--- where Node thinks each module lives ---')
console.log('web  resolved @demo/lib ->', rel(require.resolve('@demo/lib')))
console.log('lib  is running from    ->', rel(lib.libFile))
console.log('web  resolved dep       ->', rel(require.resolve('dep')))
console.log('lib  resolved dep       ->', rel(lib.depFile))

console.log('\n--- module identity ---')
console.log('same dep instance for web and lib?', dep === lib.dep)
console.log(dep.touch('web'))
console.log(lib.useDep())

console.log('\n--- what is in the module cache for dep ---')
Object.keys(require.cache)
  .filter((k) => k.includes('/dep/'))
  .forEach((k) => console.log(' ', rel(k)))
