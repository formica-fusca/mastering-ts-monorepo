// A dependency with module-level state. If two consumers share ONE instance of
// this module, they share `calls`. If Node loaded it twice (two resolved paths),
// each consumer gets its own counter and `calls` never reaches 2.
let calls = 0

exports.touch = (who) => {
  calls++
  return `${who} touched dep; calls seen by this instance = ${calls}`
}

exports.where = __filename
