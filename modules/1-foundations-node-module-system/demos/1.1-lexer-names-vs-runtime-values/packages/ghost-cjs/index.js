'use strict'

exports.real = () => 'I exist at runtime'

// (1) Assigned, then removed. cjs-module-lexer already recorded the NAME
//     `ghost` while scanning the source text — it never sees the delete.
exports.ghost = () => 'I do not survive evaluation'
delete exports.ghost

// (2) The realistic version of the same bug: an export gated behind a runtime
//     condition. The lexer records `betaFeature` unconditionally, because it
//     reads text and does not evaluate the `if`.
if (process.env.ENABLE_BETA === '1') {
  exports.betaFeature = () => 'beta enabled'
}
