// DO NOT EDIT. One importer; it reports what Node resolves from THIS file's location.
const probe = (spec) => { try { return require.resolve(spec) } catch { return 'ERROR' } }
module.exports = {
  greeter: probe('greeter'),
  helpers: probe('./helpers'),
  scopedSubpath: probe('@scope/util/extra'),
}
