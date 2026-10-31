import config = require('@demo/config')

console.log('=== CJS consumer ===')
console.log('"." resolved to        :', config.entry)
console.log(config.load())

// Dynamic for the same reason as in app-esm: written literally, TypeScript
// applies the exports map and refuses the specifier at compile time (TS2307).
const sealed = '@demo/config/' + 'lib/index.cjs'
try {
  require(sealed)
} catch (e) {
  console.log(`require ${sealed} ->`, (e as NodeJS.ErrnoException).code)
}
