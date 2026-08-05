// ┌───────────────────────────────────────────────────────────────┐
// │  EDIT THIS FILE.                                              │
// │                                                               │
// │  Goal:  make `hello` and `version` importable as NAMED         │
// │         exports from an ESM consumer.                          │
// │                                                               │
// │  Rule:  do NOT change what this module exports at runtime.     │
// │         Same keys, same values, same behaviour. Change only    │
// │         the SHAPE of the source.                               │
// └───────────────────────────────────────────────────────────────┘

const api = {}
api.hello = () => 'hi'
api.version = '1.0.0'

module.exports = api
