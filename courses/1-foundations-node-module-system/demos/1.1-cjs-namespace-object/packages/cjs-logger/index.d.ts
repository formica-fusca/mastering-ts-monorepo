interface Logger {
  log(msg: string): void
}

declare function createLogger(opts?: { level?: string }): Logger

// Mirrors the runtime member assignments in index.js. Note this declaration
// file is perfectly accurate — accuracy is not the same as link-safety.
declare namespace createLogger {
  const LEVELS: string[]
  function createLogger(opts?: { level?: string }): Logger
}

export = createLogger
