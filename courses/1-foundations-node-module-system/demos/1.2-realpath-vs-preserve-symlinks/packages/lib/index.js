// `@demo/lib` is consumed by `@demo/web` through a symlink that pnpm creates at
// packages/web/node_modules/@demo/lib -> ../../lib. Where does Node think THIS
// file lives: at the symlink, or at the real path? The answer decides where the
// walk for `dep` starts, and therefore which copy of `dep` lib gets.
const dep = require('dep')

exports.libFile = __filename
exports.depFile = require.resolve('dep')
exports.dep = dep
exports.useDep = () => dep.touch('lib')
