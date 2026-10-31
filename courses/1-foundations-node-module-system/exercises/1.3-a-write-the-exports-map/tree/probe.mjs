// DO NOT EDIT. Resolves specifiers FROM INSIDE tree/, so the walk finds tree/node_modules.
// ESM is probed with a real import(): import.meta.resolve() returns a URL without checking
// that the file exists, which would make "is refused" checks lie.
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
export const esm = async (s) => {
  const m = await import(s, s.endsWith('.json') ? { with: { type: 'json' } } : undefined)
  return m.which ?? (m.default?.name === 'toolkit' ? 'package.json' : 'unknown')
}
export const cjs = (s) => require.resolve(s)
