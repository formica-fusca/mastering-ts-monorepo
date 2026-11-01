import semver from 'semver'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const v = (require('semver/package.json') as { version: string }).version
console.log(`web: semver ${v}, valid('1.2.3') = ${semver.valid('1.2.3')}`)
