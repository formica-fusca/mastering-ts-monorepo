import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail && !ok ? `  (${detail})` : ''}`)
  if (!ok) failed++
}

console.log('\nExercise 1.1-a — make the lexer see it\n')

// --- constraint: runtime exports must be unchanged -------------------------
const raw = require('./bad.cjs')
check('runtime keys are exactly [hello, version]',
  Object.keys(raw).sort().join(',') === 'hello,version',
  `got [${Object.keys(raw).sort().join(', ')}]`)
check('hello is a function returning "hi"',
  typeof raw.hello === 'function' && raw.hello() === 'hi')
check('version is still "1.0.0"', raw.version === '1.0.0')

// --- goal: the lexer must now find both names ------------------------------
// The namespace keys come from exactly the same lexer result that a static
// `import { hello } from './bad.cjs'` links against.
const ns = await import('./bad.cjs')
check('named export `hello` is visible to ESM', typeof ns.hello === 'function',
  'the lexer found no names in this source shape')
check('named export `version` is visible to ESM', ns.version === '1.0.0',
  'the lexer found no names in this source shape')

console.log(failed === 0 ? '\n  All checks passed.\n' : `\n  ${failed} check(s) failing.\n`)
process.exit(failed === 0 ? 0 : 1)
