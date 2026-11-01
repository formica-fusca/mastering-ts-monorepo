'use strict'

function formatDate(d) {
  return d.toISOString().slice(0, 10)
}

function parseDate(s) {
  return new Date(s)
}

// Object-literal assignment with plain keys.
// cjs-module-lexer reads `formatDate` and `parseDate` straight out of this
// source text, without executing anything. Node therefore synthesizes both
// as named exports for ESM importers.
module.exports = { formatDate, parseDate }
