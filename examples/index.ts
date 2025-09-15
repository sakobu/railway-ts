// Clean, focused examples for @railway-ts/core
// Each example shows one concept clearly without bloat

export * from "./option/option-examples";
export * from "./result/result-examples";
export * from "./interop/interop-examples";
export * from "./composition/curry-basics";
export * from "./composition/tupled-basics";
export * from "./composition/advanced-composition";

/*
Example Categories:

OPTION EXAMPLES:
- Safe property access (nullable object properties)
- Safe array access (out-of-bounds protection)  
- Configuration values (environment variables with defaults)

RESULT EXAMPLES:
- Division by zero (classic explicit error handling)
- JSON parsing (converting exceptions to Results)
- Chaining operations (flatMapResult for multiple failing steps)

INTEROP EXAMPLES:
- Option → Result (adding error context to missing values)
- Result → Option (dropping error details when only success/failure matters)
- Mixed workflow (combining both types in real scenarios)

COMPOSITION EXAMPLES:
- Curry basics (making multi-arg functions pipeable)
- Tupled basics (working with tuple data)
- Advanced composition (real-world function transformation patterns)
*/
