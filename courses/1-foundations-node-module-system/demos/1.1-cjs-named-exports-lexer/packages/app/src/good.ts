// Named imports from a CJS package whose export shape the lexer CAN read.
import { formatDate, parseDate } from '@demo/legible-cjs'

// The always-safe form: default import === module.exports.
import legible from '@demo/legible-cjs'

console.log('--- @demo/legible-cjs -------------------------------')
console.log('named import formatDate :', formatDate(new Date('2026-08-05')))
console.log('named import parseDate  :', parseDate('2026-08-05').getFullYear())
console.log('default import keys     :', Object.keys(legible))
console.log('\nLexer read the object literal. Named imports linked fine.')
