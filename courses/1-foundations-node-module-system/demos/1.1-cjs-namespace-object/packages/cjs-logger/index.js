'use strict'

// A "callable package with helpers" — extremely common shape on npm.
// The module's export IS a function; helpers hang off it.
const createLogger = (opts) => ({
  log: (msg) => console.log(`[${opts?.level ?? 'info'}] ${msg}`),
})

module.exports = createLogger                      // default === this function
module.exports.createLogger = createLogger         // detectable member assignment
module.exports.LEVELS = ['debug', 'info', 'error'] // detectable member assignment
