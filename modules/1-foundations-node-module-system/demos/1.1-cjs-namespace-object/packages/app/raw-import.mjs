// ES2022 allows arbitrary string names in module namespaces. Node uses that to
// expose the raw module.exports of a CJS module under the literal name
// "module.exports". This is the escape hatch for the non-callable namespace.
//
// It is NOT type-checkable: index.d.ts cannot declare this key, so this file is
// deliberately excluded from tsconfig's `include`.
import { 'module.exports' as rawExports } from '@demo/cjs-logger'

console.log('\n=== the escape hatch ====================================')
console.log('typeof rawExports'.padEnd(30), typeof rawExports)
console.log('callable directly?'.padEnd(30), typeof rawExports === 'function')
console.log('rawExports.LEVELS'.padEnd(30), rawExports.LEVELS)
rawExports({ level: 'warn' }).log('called module.exports directly')
