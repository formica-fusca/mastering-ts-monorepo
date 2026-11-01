import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['**/dist/**', '**/node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      // These packages target Node. Without this, `console`, `process`,
      // `module`, `require` and `exports` all trip the no-undef rule.
      globals: { ...globals.node },
    },
    rules: {
      // This demo is about CommonJS resolution; `require()` IS the subject.
      // The web package also uses `import x = require()` on purpose, so that
      // identity comparisons see `module.exports` itself rather than the
      // namespace wrapper TypeScript synthesises for `import * as x`.
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]
