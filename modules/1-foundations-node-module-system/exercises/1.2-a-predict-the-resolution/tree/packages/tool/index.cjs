// DO NOT EDIT. A second importer, living somewhere else in the tree.
const probe = (spec) => { try { return require.resolve(spec) } catch { return 'ERROR' } }
module.exports = { greeter: probe('greeter') }
