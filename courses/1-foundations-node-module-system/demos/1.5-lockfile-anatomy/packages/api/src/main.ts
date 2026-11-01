import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
console.log(`api: is-odd present: ${typeof require('is-odd') === 'function'}`)
