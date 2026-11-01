// These declarations are ACCURATE about the runtime object and still USELESS
// as a safety net: TypeScript does not run cjs-module-lexer, so it happily
// accepts `import { formatDate }` from this package. The types describe what
// `module.exports` holds; they say nothing about what Node can *link*.
declare function createFormatter(locale: string): (d: Date) => string

declare namespace createFormatter {
  function formatDate(d: Date): string
}

export = createFormatter
