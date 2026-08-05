let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail && !ok ? `  (${detail})` : ''}`)
  if (!ok) failed++
}

console.log('\nExercise 1.1-b — the callable package\n')

const ns = await import('./logger.cjs')

// --- constraint: the default export must remain callable -------------------
check('default export is callable', typeof ns.default === 'function',
  `typeof default is ${typeof ns.default}`)
check('createLogger({level:"debug"}).format() still works',
  typeof ns.default === 'function' &&
  ns.default({ level: 'debug' }).format('x') === '[debug] x')

// --- goal: named exports must link -----------------------------------------
check('named export `LEVELS` is visible to ESM',
  Array.isArray(ns.LEVELS) && ns.LEVELS.join(',') === 'debug,info,error',
  'the lexer found no names in this source shape')
check('named export `createLogger` is visible to ESM',
  typeof ns.createLogger === 'function',
  'the lexer found no names in this source shape')

console.log(failed === 0 ? '\n  All checks passed.\n' : `\n  ${failed} check(s) failing.\n`)
process.exit(failed === 0 ? 0 : 1)
