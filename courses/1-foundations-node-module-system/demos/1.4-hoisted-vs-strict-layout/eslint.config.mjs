import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['**/dist/**', '**/node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // `a` uses require() deliberately: a phantom import has to be observed at
      // runtime, through Node's resolver, and require.resolve is the probe.
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]
