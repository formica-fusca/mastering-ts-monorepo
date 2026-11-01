// Neither is-odd nor is-number ships types. These ambient declarations satisfy
// TypeScript regardless of what is on disk — which is exactly why the type
// checker is blind to the phantom import in main.ts.
declare module 'is-odd' { const isOdd: (n: unknown) => boolean; export = isOdd }
declare module 'is-number' { const isNumber: (n: unknown) => boolean; export = isNumber }
