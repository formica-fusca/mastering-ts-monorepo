// ┌───────────────────────────────────────────────────────────────┐
// │  EDIT THIS FILE.                                              │
// │                                                               │
// │  Goal:  `import createLogger, { LEVELS } from './logger.cjs'` │
// │         must work from ESM.                                   │
// │                                                               │
// │  Rule:  the DEFAULT export must stay CALLABLE.                 │
// │         createLogger({ level: 'debug' }) must keep working.    │
// │                                                               │
// │  This is the real-world hard case: a package that is both a   │
// │  function and a namespace.                                    │
// └───────────────────────────────────────────────────────────────┘

const createLogger = (opts = {}) => ({
  format: (msg) => `[${opts.level ?? 'info'}] ${msg}`,
})

module.exports = Object.assign(createLogger, {
  createLogger,
  LEVELS: ['debug', 'info', 'error'],
})
