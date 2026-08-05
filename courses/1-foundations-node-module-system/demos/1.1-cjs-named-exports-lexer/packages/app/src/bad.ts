// Same syntax as good.ts, against a package whose export shape the lexer
// CANNOT read. This file type-checks and compiles cleanly.
//
// It dies at LINK time — before a single line below executes. Note that not
// even the console.log on the next line runs.
import { formatDate } from '@demo/opaque-cjs'

console.log('if you can read this, the link succeeded — it should not have')
console.log(formatDate(new Date('2026-08-05')))
