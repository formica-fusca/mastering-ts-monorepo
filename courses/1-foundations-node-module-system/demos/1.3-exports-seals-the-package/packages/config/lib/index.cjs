// The CJS entry — served to `require()` consumers by the "require" condition.
// Functionally identical to index.js. It is a DIFFERENT FILE, which under
// lesson 1.2's rules means a different module instance with its own state.
const entry = 'lib/index.cjs (CJS)'
const instance = { entry, hits: 0 }
exports.entry = entry
exports.instance = instance
exports.load = () => { instance.hits++; return `config loaded from ${entry}` }
