console.log('=== evaluation order =======================')   // line 1
console.log('  [importer body starts]')                       // line 2
import './side.js'                                            // line 3
console.log('  [importer body ends]')                         // line 4
console.log('')
console.log('side.ts ran before line 1. Import declarations are hoisted;')
console.log('the whole dependency subgraph evaluates first.')
