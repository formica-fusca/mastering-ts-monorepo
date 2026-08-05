'use strict'

// Functionally identical to @demo/counter-esm — same logic, same intent.
let count = 0

// ...except THIS LINE. It copies the VALUE of `count` onto the exports object,
// right now. The copy has no further relationship to the variable.
exports.count = count

exports.inc = () => {
  count++
}
