// The ESM entry — served to `import` consumers by the "import" condition.
export const entry = 'lib/index.js (ESM)'
export const instance = { entry, hits: 0 }
export const load = () => { instance.hits++; return `config loaded from ${entry}` }
