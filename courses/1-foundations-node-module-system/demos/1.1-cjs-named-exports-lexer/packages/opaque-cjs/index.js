'use strict'

function createFormatter(locale) {
  return (d) => d.toLocaleDateString(locale)
}

function formatDate(d) {
  return d.toISOString().slice(0, 10)
}

// THE TRAP.
//
// At runtime this is *identical* to:
//     module.exports = createFormatter
//     module.exports.formatDate = formatDate
//
// Same properties, same values, same everything — once the code has run.
//
// But cjs-module-lexer never runs the code. It reads source text, and
// `Object.assign(...)` is not one of the shapes it recognises. So it finds
// ZERO named exports here, and `import { formatDate }` fails at link time.
module.exports = Object.assign(createFormatter, { formatDate })
