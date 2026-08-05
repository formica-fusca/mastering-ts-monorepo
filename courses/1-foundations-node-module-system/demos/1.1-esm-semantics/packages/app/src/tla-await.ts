// Top-level await. This makes the module's EVALUATION asynchronous.
await new Promise((resolve) => setTimeout(resolve, 1))
export const ready = 'with TLA'
