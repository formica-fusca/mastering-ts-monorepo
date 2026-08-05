// A true ESM package. Note: NO default export is declared.
export const LEVELS = ['debug', 'info', 'error']

export const createLogger = (opts) => ({
  log: (msg) => console.log(`[${opts?.level ?? 'info'}] ${msg}`),
})
