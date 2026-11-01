// These declarations are what a package author would naturally write. They are
// wrong in a way no type checker can detect: `ghost` and `betaFeature` are not
// always present on the runtime object.
export declare function real(): string
export declare function ghost(): string
export declare function betaFeature(): string
