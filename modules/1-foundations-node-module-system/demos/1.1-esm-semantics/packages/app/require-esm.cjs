// A CommonJS file requiring compiled ESM output.
console.log('')
console.log('=== require() of ESM =======================')

try {
  console.log('require tla-plain.js ->', require('./dist/tla-plain.js').ready)
} catch (err) {
  console.log('require tla-plain.js ->', err.code)
}

try {
  console.log('require tla-await.js ->', require('./dist/tla-await.js').ready)
} catch (err) {
  console.log('require tla-await.js ->', err.code, ' <- top-level await')
}
