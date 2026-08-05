import * as cjsNs from '@demo/cjs-logger'
import * as esmNs from '@demo/esm-logger'

const row = (k: string, v: unknown) => console.log(k.padEnd(30), v)

console.log('=== CJS package: synthesized namespace ==================')
row('namespace keys', Object.keys(cjsNs).sort())
row('has "default"?', 'default' in cjsNs)
row('typeof namespace', typeof cjsNs)
row('namespace callable?', typeof (cjsNs as unknown) === 'function')
row('default callable?', typeof cjsNs.default === 'function')
row('Symbol.toStringTag', (cjsNs as { [Symbol.toStringTag]?: string })[Symbol.toStringTag])
row('extensible?', Object.isExtensible(cjsNs))

console.log('\n=== true ESM package: real namespace ====================')
row('namespace keys', Object.keys(esmNs).sort())
row('has "default"?', 'default' in esmNs)
row('Symbol.toStringTag', (esmNs as { [Symbol.toStringTag]?: string })[Symbol.toStringTag])

console.log('\n=== the trap ============================================')
// module.exports IS a function, but the NAMESPACE is a sealed object wrapper.
try {
  ;(cjsNs as unknown as (o?: unknown) => unknown)({ level: 'debug' })
  console.log('namespace was callable — unexpected')
} catch (err) {
  console.log('calling the namespace ->', (err as Error).constructor.name + ':', (err as Error).message)
}
cjsNs.default({ level: 'debug' }).log('calling .default works')
