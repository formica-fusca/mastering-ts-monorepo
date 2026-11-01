import { count, inc } from '@demo/counter-esm'
import { createRequire } from 'node:module'

// No `require` in ESM — see the module-scope demo.
const require = createRequire(import.meta.url)
const cjs = require('@demo/counter-cjs') as { count: number; inc: () => void }

console.log('=== live bindings ==========================')
console.log('               ESM      CJS')
console.log('before inc()  ', count, '      ', cjs.count)

inc()
cjs.inc()

console.log('after  inc()  ', count, '      ', cjs.count)
console.log('')

// Report what actually happened rather than asserting a conclusion — the
// break-it exercise changes the answer, and a hardcoded verdict would lie.
if (count === cjs.count) {
  console.log('Both readers observed the increment.')
  console.log('The CJS package is exposing a live view, not a value copy.')
} else {
  console.log('Both counters were incremented. Only the ESM reader observed it.')
  console.log(`The CJS export is a copy, frozen at ${cjs.count}.`)
}
