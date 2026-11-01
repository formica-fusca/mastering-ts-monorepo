// ┌───────────────────────────────────────────────────────────────┐
// │  EDIT THIS FILE (and consumer.mjs).                           │
// │                                                               │
// │  Goal:  an ESM consumer must be able to OBSERVE the updated   │
// │         count after calling inc().                            │
// │                                                               │
// │  Rule:  this package stays CommonJS. No "type": "module",     │
// │         no rewrite to export syntax.                          │
// │                                                               │
// │  Warning: the obvious fix is only half the answer. Read the   │
// │  README before assuming you are done.                         │
// └───────────────────────────────────────────────────────────────┘

let count = 0

exports.count = count          // a COPY, taken right now
exports.inc = () => { count++ }
