// `count` is exported as a LIVE BINDING: importers hold a reference into this
// module's scope, not a copy of the value.
export let count = 0

export function inc() {
  count++
}
