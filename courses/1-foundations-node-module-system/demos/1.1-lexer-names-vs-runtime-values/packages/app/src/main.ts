import { real, ghost, betaFeature } from '@demo/ghost-cjs'
import * as ns from '@demo/ghost-cjs'

const row = (k: string, v: unknown) => console.log(k.padEnd(26), v)

console.log('=== what the LEXER decided (names) ======================')
row('namespace keys', Object.keys(ns).sort())

console.log('\n=== what the RUNTIME provided (values) =================')
row('typeof real', typeof real)
row('typeof ghost', typeof ghost)
row('typeof betaFeature', typeof betaFeature)
row('ENABLE_BETA', process.env.ENABLE_BETA ?? '(unset)')

console.log('\n=== the consequence ====================================')
console.log('real() ->', real())

// Type-checked as a function. Is undefined at runtime. No import error fired.
try {
  console.log('ghost() ->', ghost())
} catch (err) {
  console.log('ghost() ->', (err as Error).constructor.name + ':', (err as Error).message)
}
