import { createRequire } from 'node:module'
import ownPkg = require('../package.json')

const rel = (p: string) => p.replace(process.cwd(), '<root>')
const version = (pkg: string, from: string) =>
  (createRequire(from)(`${pkg}/package.json`) as { version: string }).version

console.log('=== package a ===')
console.log('a declares        :', Object.keys(ownPkg.dependencies ?? {}).join(', ') || '(nothing)')

let isOddPath: string | null = null
try {
  isOddPath = require.resolve('is-odd')
  console.log('is-odd resolved   :', rel(isOddPath))
  console.log('is-odd depends on : is-number', version('is-number', isOddPath))
} catch {
  console.log('is-odd            : not declared, not reachable')
}

console.log('\n--- the phantom: a never declared is-number ---')
try {
  const isNumberPath = require.resolve('is-number')
  console.log('a gets is-number  :', version('is-number', isNumberPath), 'at', rel(isNumberPath))
  if (isOddPath) console.log('same copy as is-odd uses?', isNumberPath === createRequire(isOddPath).resolve('is-number'))
} catch (e) {
  console.log('require("is-number") ->', (e as NodeJS.ErrnoException).code)
  console.log('a cannot reach a package it never declared. This is the correct outcome.')
}
