// Served by the "default" condition. In the shipped state nothing reaches it,
// because "import" or "require" always matches first. See README → Break it.
const entry = 'lib/fallback.cjs (DEFAULT — you should not be seeing this)'
const instance = { entry, hits: 0 }
exports.entry = entry
exports.instance = instance
exports.load = () => { instance.hits++; return `config loaded from ${entry}` }
