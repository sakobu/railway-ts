# @railway-ts/core

[![npm version](https://img.shields.io/npm/v/@railway-ts/core.svg)](https://www.npmjs.com/package/@railway-ts/core) [![Build Status](https://github.com/sakobu/railway-ts/workflows/CI/badge.svg)](https://github.com/sakobu/railway-ts/actions) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Bundle Size](https://img.shields.io/bundlephobia/minzip/@railway-ts/core)](https://bundlephobia.com/package/@railway-ts/core) [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/) [![Coverage](https://img.shields.io/codecov/c/github/sakobu/railway-ts)](https://codecov.io/gh/sakobu/railway-ts)

Pragmatic functional programming primitives for TypeScript: total, explicit, and typed.

## Table of Contents

- [Why Railway-ts](#why-railway-ts)
- [Mental Model](#mental-model)
- [Installation](#installation)
- [Running Examples](#running-examples)
- [Quick Start](#quick-start)
- [Working with Multi-Argument Functions](#working-with-multi-argument-functions)
- [Option: Safe Nullable Handling](#option-safe-nullable-handling)
- [Result: Explicit Error Handling](#result-explicit-error-handling)
- [Async Patterns](#async-patterns)
  - [Wrapping Promises](#wrapping-promises)
  - [Wrapping Throwing Functions](#wrapping-throwing-functions)
- [Combining Multiple Values](#combining-multiple-values)
- [Interop Between Option and Result](#interop-between-option-and-result)
- [Composition Utilities](#composition-utilities)
  - [`pipe` - Immediate Execution](#pipe---immediate-execution)
  - [`flow` - Function Composition](#flow---function-composition)
  - [`curry` - Partial Application and Composition](#curry---partial-application-and-composition)
  - [`uncurry` - Convert Curried to Multi-Arg](#uncurry---convert-curried-to-multi-arg)
  - [`tupled` - Adapt Multi-Arg to Tuple Input](#tupled---adapt-multi-arg-to-tuple-input)
  - [`untupled` - Adapt Tuple Input to Multi-Arg](#untupled---adapt-tuple-input-to-multi-arg)
- [Comparison with Other Libraries](#comparison-with-other-libraries)
- [Tree-Shaking](#tree-shaking)
- [API Reference](#api-reference)
  - [Option Functions](#option-functions)
  - [Result Functions](#result-functions)
  - [Utilities](#utilities)
- [Design Principles](#design-principles)
- [License](#license)

## Why Railway-ts

- **Explicit control flow**: represent absence with `Option`, failures with `Result`
- **Typed all the way**: no `any`; generics preserve types across transformations
- **Tiny and ergonomic**: a minimal set of small, pure functions
- **Composition-first**: `pipe` and `flow` make it easy to build clear data flows

## Mental Model

- **Option<T>** represents an optional value: `Some<T>` (has a value) or `None` (absence)
- **Result<T, E>** represents success or failure: `Ok<T>` (has a value) or `Err<E>` (has an error)

Prefer `Option` when absence is expected and not exceptional; prefer `Result` when you must carry error information.

## Installation

```bash
# npm
npm install @railway-ts/core

# yarn
yarn add @railway-ts/core

# pnpm
pnpm add @railway-ts/core

# bun
bun add @railway-ts/core
```

## Running Examples

```bash
# Clone the repository
git clone https://github.com/sakobu/railway-ts.git
cd railway-ts

# Install dependencies and run examples
bun install
bun run examples/index.ts
```

## Quick Start

```typescript
import { pipe, some, mapOption, filterOption, unwrapOptionOr } from "@railway-ts/core";

const value = pipe(
  some(21),
  (o) => mapOption(o, (n) => n * 2), // Some(42)
  (o) => filterOption(o, (n) => n >= 40),
  (o) => unwrapOptionOr(o, 0), // 42
);
```

```typescript
import { pipe, ok, err, mapResult, filterResult, matchResult } from "@railway-ts/core";

const message = pipe(
  ok(10),
  (r) => mapResult(r, (n) => n * 4), // Ok(40)
  (r) => filterResult(r, (n) => n >= 42, "too small"),
  (r) =>
    matchResult(r, {
      ok: (n) => `ok: ${n}`,
      err: (e) => `error: ${e}`,
    }),
);
```

## Working with Multi-Argument Functions

`pipe` and `flow` work with unary functions. Real code has multi-argument functions.

```typescript
import { pipe, curry, tupled } from "@railway-ts/core";

const add = (a: number, b: number) => a + b;
const divide = (dividend: number, divisor: number) => dividend / divisor;

// Use curry for partial application
const result1 = pipe(
  10,
  curry(add)(5), // 15
  curry(divide)(3), // 5
);

// Use tupled when data comes as pairs
const result2 = pipe(
  [10, 2],
  tupled(divide), // 5
  (n) => n * 2, // 10
);
```

## Option: Safe Nullable Handling

```typescript
import {
  pipe,
  fromNullableOption,
  mapOption,
  flatMapOption,
  filterOption,
  matchOption,
  some,
  none,
} from "@railway-ts/core";

const sanitize = (s: string) => s.trim();
const parseAge = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? some(n) : none<number>();
};

const processInput = (input: string | null | undefined) =>
  pipe(
    fromNullableOption(input),
    (o) => mapOption(o, sanitize),
    (o) => flatMapOption(o, parseAge),
    (o) =>
      matchOption(o, {
        some: (age) => `Age: ${age}`,
        none: () => "Invalid age",
      }),
  );
```

## Result: Explicit Error Handling

```typescript
import { pipe, ok, err, flatMapResult, mapResult, matchResult } from "@railway-ts/core";

type PositiveError = { readonly reason: "non_positive" };

const ensurePositive = (n: number) =>
  n > 0 ? ok<number, PositiveError>(n) : err<PositiveError>({ reason: "non_positive" });

const calculate = pipe(
  ok<number, PositiveError>(4),
  (r) => flatMapResult(r, ensurePositive),
  (r) => mapResult(r, (n) => n * 3),
  (r) =>
    matchResult(r, {
      ok: (n) => `result: ${n}`,
      err: (e) => `error: ${e.reason}`,
    }),
);
```

## Async Patterns

### Wrapping Promises

```typescript
import { fromPromise, matchResult } from "@railway-ts/core";

type ApiError = { readonly code: number; readonly message: string };

const safeFetch = async (url: string) =>
  fromPromise<Response, ApiError>(fetch(url), (e) => ({
    code: 500,
    message: e instanceof Error ? e.message : String(e),
  }));

const result = await safeFetch("/api/data");
matchResult(result, {
  ok: (response) => console.log("Success:", response.status),
  err: (error) => console.error(`[${error.code}] ${error.message}`),
});
```

### Wrapping Throwing Functions

```typescript
import { fromTry, mapResult } from "@railway-ts/core";

const parseJson = (s: string) => fromTry(() => JSON.parse(s));

const safe = mapResult(parseJson('{"x":1}'), (v) => v.x); // Ok(1)
const unsafe = parseJson("invalid"); // Err(SyntaxError)
```

## Combining Multiple Values

```typescript
import { combineOption, combineResult, combineAllResult } from "@railway-ts/core";

// Option: all-or-nothing
combineOption([some(1), some(2), some(3)]); // Some([1,2,3])
combineOption([some(1), none(), some(3)]); // None

// Result: fail-fast
combineResult([ok(1), ok(2), ok(3)]); // Ok([1,2,3])
combineResult([ok(1), err("boom"), ok(3)]); // Err("boom")

// Result: collect all errors
combineAllResult([ok(1), err("a"), err("b"), ok(2)]); // Err(["a","b"])
```

## Interop Between Option and Result

```typescript
import { mapToResult, mapToOption, some, none, ok, err } from "@railway-ts/core";

// Option → Result (inject error for None)
const r1 = mapToResult(some(123), "missing"); // Ok(123)
const r2 = mapToResult(none<number>(), "missing"); // Err("missing")

// Result → Option (drop error info)
const o1 = mapToOption(ok(10)); // Some(10)
const o2 = mapToOption(err("boom")); // None
```

## Composition Utilities

### `pipe` - Immediate Execution

```typescript
const result = pipe(
  5,
  (n) => n * 2, // 10
  (n) => n + 1, // 11
  (n) => n.toString(), // "11"
);
```

### `flow` - Function Composition

```typescript
const processNumber = flow(
  (n: number) => n * 2,
  (n) => n + 1,
  (n) => n.toString(),
);

const result = processNumber(5); // "11"
```

### `curry` - Partial Application and Composition

```typescript
import { pipe, curry } from "@railway-ts/core";

const add = (a: number, b: number) => a + b;
const multiply = (a: number, b: number) => a * b;

const value = pipe(
  10,
  curry(add)(5), // 15
  curry(multiply)(2), // 30
);

const add5 = curry(add)(5);
const double = curry(multiply)(2);
const also = pipe(10, add5, double); // 30
```

### `uncurry` - Convert Curried to Multi-Arg

```typescript
import { uncurry } from "@railway-ts/core";

const clamp = (min: number) => (max: number) => (value: number) => Math.min(max, Math.max(min, value));

const normalClamp = uncurry(clamp);
normalClamp(0, 100, 150); // 100
```

### `tupled` - Adapt Multi-Arg to Tuple Input

```typescript
import { pipe, tupled } from "@railway-ts/core";

const calculateTotal = (price: number, tax: number, discount: number) => price * (1 + tax) - discount;

const total = pipe(
  [100, 0.1, 10],
  tupled(calculateTotal), // 100
);
```

### `untupled` - Adapt Tuple Input to Multi-Arg

```typescript
import { untupled } from "@railway-ts/core";

const divmod = ([n, d]: [number, number]): [number, number] => [Math.floor(n / d), n % d];

const normalDivmod = untupled(divmod);
normalDivmod(20, 7); // [2, 6]
```

## Comparison with Other Libraries

| Feature               | @railway-ts/core | neverthrow | fp-ts     | ts-results |
| --------------------- | ---------------- | ---------- | --------- | ---------- |
| Option support        | ✅               | ❌         | ✅        | ❌         |
| Tree-shakable         | ✅               | Limited    | Limited   | ✅         |
| Learning curve        | Simple           | Simple     | Complex   | Simple     |
| Bundle size           | Small            | Medium     | Large     | Small      |
| API style             | Functions        | Methods    | Functions | Classes    |
| Composition utilities | ✅               | ❌         | ✅        | ❌         |

## Tree-Shaking

Import only what you need:

```typescript
// Import with prefixes (recommended)
import { some, mapOption, ok, mapResult, pipe } from "@railway-ts/core";

// Import directly from modules
import { some, map } from "@railway-ts/core/option";
import { ok, err } from "@railway-ts/core/result";
import { pipe, flow } from "@railway-ts/core/utils";
```

## API Reference

### Option Functions

| Function                                                  | Description                  |
| --------------------------------------------------------- | ---------------------------- |
| `some<T>(value: T)`                                       | Create Option with value     |
| `none<T>()`                                               | Create empty Option          |
| `isSome<T>(o: Option<T>)`                                 | Type guard for Some          |
| `isNone<T>(o: Option<T>)`                                 | Type guard for None          |
| `mapOption<T, U>(o: Option<T>, fn: T => U)`               | Transform value              |
| `flatMapOption<T, U>(o: Option<T>, fn: T => Option<U>)`   | Chain operations             |
| `filterOption<T>(o: Option<T>, pred: T => boolean)`       | Conditional keep             |
| `unwrapOption<T>(o: Option<T>, errorMsg?: string)`        | Get value or throw           |
| `unwrapOptionOr<T>(o: Option<T>, default: T)`             | Get value or default         |
| `unwrapOptionOrElse<T>(o: Option<T>, defaultFn: () => T)` | Get value or compute default |
| `fromNullableOption<T>(val: T \| null \| undefined)`      | Convert nullable             |
| `combineOption<T>(opts: Option<T>[])`                     | All-or-nothing combine       |
| `matchOption<T, R>(o: Option<T>, patterns)`               | Pattern match                |
| `tapOption<T>(o: Option<T>, fn: (value: T) => void)`      | Execute side effect if Some  |
| `mapToResult<T, E>(o: Option<T>, error: E)`               | Convert Option to Result     |

### Result Functions

| Function                                                            | Description                    |
| ------------------------------------------------------------------- | ------------------------------ |
| `ok<T, E>(value: T)`                                                | Create success Result          |
| `err<E>(error: E)`                                                  | Create error Result            |
| `isOk<T, E>(r: Result<T, E>)`                                       | Type guard for Ok              |
| `isErr<T, E>(r: Result<T, E>)`                                      | Type guard for Err             |
| `mapResult<T, E, U>(r: Result<T, E>, fn: T => U)`                   | Transform success              |
| `mapErrorResult<T, E, F>(r: Result<T, E>, fn: E => F)`              | Transform error                |
| `flatMapResult<T, E, U>(r: Result<T, E>, fn: T => Result<U, E>)`    | Chain operations               |
| `filterResult<T, E>(r: Result<T, E>, pred: T => boolean, error: E)` | Returns Err if predicate fails |
| `unwrapResult<T, E>(r: Result<T, E>, errorMsg?: string)`            | Get value or throw             |
| `unwrapResultOr<T, E>(r: Result<T, E>, defaultValue: T)`            | Get value or default           |
| `unwrapResultOrElse<T, E>(r: Result<T, E>, defaultFn: () => T)`     | Get value or compute default   |
| `combineResult<T, E>(rs: Result<T, E>[])`                           | Fail-fast combine              |
| `combineAllResult<T, E>(rs: Result<T, E>[])`                        | Collect all errors             |
| `matchResult<T, E, R>(r: Result<T, E>, patterns)`                   | Pattern match                  |
| `tapResult<T, E>(r: Result<T, E>, fn: (value: T) => void)`          | Execute side effect if Ok      |
| `tapErrorResult<T, E>(r: Result<T, E>, fn: (error: E) => void)`     | Execute side effect if Err     |
| `mapToOption<T, E>(r: Result<T, E>)`                                | Convert Result to Option       |
| `fromTry<T>(fn: () => T)`                                           | Wrap throwing function         |
| `fromPromise<T, E>(p: Promise<T>, errorFn?)`                        | Wrap Promise                   |
| `toPromise<T, E>(r: Result<T, E>)`                                  | Convert Result to Promise      |

### Utilities

| Function              | Description                        |
| --------------------- | ---------------------------------- |
| `pipe(value, ...fns)` | Left-to-right function application |
| `flow(...fns)`        | Create composed function           |
| `curry(fn)`           | Multi-arg → unary chain            |
| `uncurry(fn)`         | Unary chain → multi-arg            |
| `tupled(fn)`          | Multi-arg → tuple-accepting        |
| `untupled(fn)`        | Tuple-accepting → multi-arg        |

## Design Principles

- Functions are pure and data-last for clean composition
- No throwing except explicit `unwrap` helpers (prototyping only)
- Comprehensive TypeScript integration with proper type inference
- Simple discriminated unions with brand symbols for safety

## License

MIT

---

Inspired by functional programming concepts from Rust, F#, Scala, and Haskell.
