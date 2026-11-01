interface Logger {
  log(msg: string): void
}

export declare const LEVELS: string[]
export declare function createLogger(opts?: { level?: string }): Logger
