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
      // The CJS consumer and the CJS entry of `config` use require() on
      // purpose: the `require` condition is half of what this demo exhibits.
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]
