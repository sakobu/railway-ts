# railway-ts

A small, practical library for functional programming in TypeScript, focused on Railway Oriented Programming patterns.

## Overview

`railway-ts` provides robust abstractions for handling operations that might fail (`Result`) and values that might not exist (`Option`). These patterns help you write more predictable code by forcing the explicit handling of edge cases.

The library stays intentionally small with a focused API, embracing TypeScript's type system to enhance your development experience without adding unnecessary complexity.

## Installation

```bash
# npm
npm install railway-ts

# yarn
yarn add railway-ts

# pnpm
pnpm add railway-ts

# bun
bun add railway-ts
```

## Features

- **Option<T>**: A type-safe way to handle optional values without null or undefined
- **Result<T, E>**: Error handling without exceptions
- **Utility functions**: Functional composition tools like `pipe()` and `flow()`
- **Fully typed**: Built with TypeScript for a great developer experience
- **Tree-shakable**: Import only what you need
- **Zero dependencies**: Lightweight with no external runtime dependencies
- **Module-based architecture**: Access the entire API or just the parts you need

## Comparison with Similar Libraries

### railway-ts vs neverthrow

- **Option Support**: railway-ts includes both Result and Option types, while neverthrow only provides Result
- **Tree Shaking**: railway-ts is fully tree-shakable with individual function imports; neverthrow uses namespaces which limit tree-shaking capabilities
- **Bundle Size**: railway-ts is likely smaller when tree-shaken due to its more modular architecture
- **API Design**: railway-ts uses standalone utility functions; neverthrow employs method chaining via namespaces
- **Module Structure**: railway-ts provides direct module imports (railway-ts/option) for further optimization

### railway-ts vs fp-ts

- **Learning Curve**: railway-ts offers a simpler, more approachable API focused on practical use cases
- **Scope**: railway-ts is specifically designed for Option/Result patterns; fp-ts is a comprehensive functional programming ecosystem
- **Type System**: railway-ts leverages TypeScript's type system without advanced higher-kinded type simulations
- **Bundle Size**: railway-ts is significantly lighter than fp-ts when only Option/Result functionality is needed
- **Philosophy**: railway-ts prioritizes pragmatic simplicity; fp-ts emphasizes theoretical correctness

### railway-ts vs ts-results

- **API Style**: railway-ts uses standalone utility functions; ts-results primarily uses class-based implementation
- **Function Composition**: railway-ts includes pipe/flow utilities for cleaner, more readable composition
- **Bundle Size**: Both are relatively lightweight, but railway-ts has better tree-shaking
- **Type Safety**: Both provide robust type safety, with railway-ts focusing on pattern matching and function composition

### railway-ts vs purify-ts

- **Naming**: railway-ts uses Option/Result vs purify's Maybe/Either (more familiar to Rust developers)
- **Complexity**: railway-ts maintains a simpler API with fewer abstractions than purify-ts
- **Integration**: railway-ts provides dedicated utilities for integrating with Promise-based code and handling exceptions
- **Philosophy**: railway-ts focuses specifically on railway-oriented programming patterns, while purify-ts covers broader functional programming concepts

## Usage

### Option Type

Option is a type that represents an optional value: it's either `Some(value)` or `None`.

```typescript
import { some, none, mapOption, matchOption } from "railway-ts";
// Or directly from the module:
// import { some, none, map, match } from 'railway-ts/option';

// Creating Options
const withValue = some(42);
const empty = none<number>();

// Transforming Options
const doubled = mapOption(withValue, (x) => x * 2); // some(84)

// Pattern matching
const message = matchOption(doubled, {
  some: (value) => `Got value: ${value}`,
  none: () => "Got nothing",
}); // "Got value: 84"

// Safe handling of nullable values
import { fromNullableOption } from "railway-ts";
const maybeUser = fromNullableOption(getUser()); // Returns Option<User>
```

### Result Type

Result is a type that represents either success (`Ok`) or failure (`Err`).

```typescript
import { ok, err, mapResult, matchResult } from "railway-ts";
// Or directly from the module:
// import { ok, err, map, match } from 'railway-ts/result';

// Creating Results
const success = ok<number, string>(42);
const failure = err<string>("Something went wrong");

// Transforming Results
const doubled = mapResult(success, (x) => x * 2); // ok(84)

// Pattern matching
const message = matchResult(doubled, {
  ok: (value) => `Success: ${value}`,
  err: (error) => `Error: ${error}`,
}); // "Success: 84"

// Working with async operations
import { fromPromise } from "railway-ts";

async function fetchData() {
  const result = await fromPromise(fetch("https://api.example.com/data"));
  return matchResult(result, {
    ok: (response) => handleResponse(response),
    err: (error) => handleError(error),
  });
}
```

### Function Composition

Compose functions with `pipe` and `flow`:

```typescript
import { pipe, flow, some, mapOption, filterOption } from "railway-ts";

// pipe: process value through a series of functions
const result = pipe(
  5,
  (n) => n * 2, // 10
  (n) => n + 1, // 11
  (n) => n.toString(), // "11"
);

// flow: create a new function from a composition
const processNumber = flow(
  (n: number) => n * 2,
  (n) => n + 1,
  (n) => n.toString(),
);

const processed = processNumber(5); // "11"

// Works seamlessly with Option and Result
const processOption = flow(
  (n: number) => some(n),
  (opt) => mapOption(opt, (n) => n * 2),
  (opt) => filterOption(opt, (n) => n > 5),
);

const optionResult = processOption(10); // some(20)
```

## API Documentation

### Option Module

The `Option<T>` type represents a value that may or may not exist:

```typescript
export const OPTION_BRAND = Symbol("OPTION_BRAND");

export type Option<T> =
  | {
      readonly some: true;
      readonly value: T;
      readonly [OPTION_BRAND]: "some";
    }
  | {
      readonly some: false;
      readonly [OPTION_BRAND]: "none";
    };
```

Core functions:

| Function                                                         | Description                          |
| ---------------------------------------------------------------- | ------------------------------------ |
| `some<T>(value: T)`                                              | Creates an Option containing a value |
| `none<T>()`                                                      | Creates an empty Option              |
| `isSome<T>(option: Option<T>)`                                   | Type guard for Some variant          |
| `isNone<T>(option: Option<T>)`                                   | Type guard for None variant          |
| `map<T, U>(option: Option<T>, fn: (value: T) => U)`              | Transforms the value if present      |
| `flatMap<T, U>(option: Option<T>, fn: (value: T) => Option<U>)`  | Chain operations that return Options |
| `filter<T>(option: Option<T>, predicate: (value: T) => boolean)` | Returns None if predicate fails      |
| `unwrap<T>(option: Option<T>, errorMsg?: string)`                | Get the value or throw error         |
| `unwrapOr<T>(option: Option<T>, defaultValue: T)`                | Get the value or return default      |
| `unwrapOrElse<T>(option: Option<T>, defaultFn: () => T)`         | Get value or compute default         |
| `fromNullable<T>(value: T \| null \| undefined)`                 | Convert nullable to Option           |
| `combine<T>(options: Option<T>[])`                               | Combine multiple Options             |
| `match<T, R>(option, patterns)`                                  | Pattern match on Option              |
| `tap<T>(option: Option<T>, fn: (value: T) => void)`              | Execute side effect if Some          |
| `mapToResult<T, E>(option: Option<T>, error: E)`                 | Convert Option to Result             |

### Result Module

The `Result<T, E>` type represents an operation that may succeed or fail:

```typescript
export const RESULT_BRAND = Symbol("RESULT_BRAND");

export type Result<T, E> =
  | {
      readonly ok: true;
      readonly value: T;
      readonly [RESULT_BRAND]: "ok";
    }
  | {
      readonly ok: false;
      readonly error: E;
      readonly [RESULT_BRAND]: "error";
    };
```

Core functions:

| Function                                                                         | Description                               |
| -------------------------------------------------------------------------------- | ----------------------------------------- |
| `ok<T, E>(value: T)`                                                             | Creates a successful Result               |
| `err<E>(error: E)`                                                               | Creates a failed Result                   |
| `isOk<T, E>(result: Result<T, E>)`                                               | Type guard for Ok variant                 |
| `isErr<T, E>(result: Result<T, E>)`                                              | Type guard for Err variant                |
| `map<T, E, U>(result: Result<T, E>, fn: (value: T) => U)`                        | Transforms success value                  |
| `mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F)`                     | Transforms error value                    |
| `flatMap<T, E, U>(result: Result<T, E>, fn: (value: T) => Result<U, E>)`         | Chain operations that return Results      |
| `filter<T, E>(result: Result<T, E>, predicate: (value: T) => boolean, error: E)` | Returns Err if predicate fails            |
| `unwrap<T, E>(result: Result<T, E>, errorMsg?: string)`                          | Get value or throw error                  |
| `unwrapOr<T, E>(result: Result<T, E>, defaultValue: T)`                          | Get value or return default               |
| `unwrapOrElse<T, E>(result: Result<T, E>, defaultFn: () => T)`                   | Get value or compute default              |
| `combine<T, E>(results: Result<T, E>[])`                                         | Combine multiple Results (first error)    |
| `combineAll<T, E>(results: Result<T, E>[])`                                      | Combine multiple Results (all errors)     |
| `match<T, E, R>(result, patterns)`                                               | Pattern match on Result                   |
| `tap<T, E>(result: Result<T, E>, fn: (value: T) => void)`                        | Execute side effect if Ok                 |
| `tapErr<T, E>(result: Result<T, E>, fn: (error: E) => void)`                     | Execute side effect if Err                |
| `mapToOption<T, E>(result: Result<T, E>)`                                        | Convert Result to Option                  |
| `fromTry<T>(f: () => T)`                                                         | Wraps function that might throw in Result |
| `fromPromise<T, E>(promise: Promise<T>, errorFn?)`                               | Wraps Promise in Result                   |
| `toPromise<T, E>(result: Result<T, E>)`                                          | Converts Result to Promise                |

### Utility Module

| Function              | Description                                  |
| --------------------- | -------------------------------------------- |
| `pipe(value, ...fns)` | Passes value through functions left to right |
| `flow(...fns)`        | Creates a new function from composition      |

## Advanced Examples

### Using Option for null-safety

```typescript
import { fromNullableOption, matchOption } from "railway-ts";

function getUserName(userId: string) {
  const user = findUser(userId); // might return null

  return pipe(
    fromNullableOption(user),
    (opt) => mapOption(opt, (user) => user.name),
    (opt) =>
      matchOption(opt, {
        some: (name) => name,
        none: () => "Guest",
      }),
  );
}
```

### Error handling with Result

```typescript
import { fromTry, mapResult, matchResult } from "railway-ts";

function parseJSON(input: string) {
  return fromTry(() => JSON.parse(input));
}

function processData(input: string) {
  return pipe(
    parseJSON(input),
    (result) => mapResult(result, (data) => transformData(data)),
    (result) =>
      matchResult(result, {
        ok: (data) => ({ success: true, data }),
        err: (error) => ({ success: false, error: error.message }),
      }),
  );
}
```

### Converting between Option and Result

```typescript
import { some, none, fromNullableOption, mapToResult, ok, err, mapToOption, pipe, flatMapResult } from "railway-ts";

// Example: User authentication flow
type User = { id: string; name: string };
type AuthError = { code: number; message: string };

// 1. Converting Option to Result
function findUserById(id: string): Option<User> {
  // Database lookup that might return null
  const user = getUserFromDb(id);
  return fromNullableOption(user);
}

function authenticateUser(id: string): Result<User, AuthError> {
  // Convert Option<User> to Result<User, AuthError>
  return pipe(findUserById(id), (userOption) => mapToResult(userOption, { code: 404, message: "User not found" }));
}

// 2. Converting Result to Option
function validateToken(token: string): Result<string, AuthError> {
  if (!token) return err({ code: 401, message: "Token required" });
  if (!isValidFormat(token)) return err({ code: 400, message: "Invalid token format" });
  return ok(token);
}

function tryGetUserIdFromToken(token: string): Option<string> {
  // Convert Result<string, AuthError> to Option<string>
  // Discards the error information but preserves the success value
  return pipe(validateToken(token), (tokenResult) => mapToOption(tokenResult));
}

// 3. Combining both patterns in a workflow
async function getUserProfile(token: string): Promise<Result<User, AuthError>> {
  // First validate the token (Result-based validation)
  return pipe(
    validateToken(token),
    // Extract user ID from token if valid
    (tokenResult) =>
      flatMapResult(tokenResult, (token) => {
        const userId = extractUserId(token);

        // Find the user (Option-based retrieval)
        const userOption = findUserById(userId);

        // Convert Option to Result with appropriate error
        return mapToResult(userOption, { code: 404, message: "User profile not found" });
      }),
  );
}

// Usage
async function handleRequest(request) {
  const { token } = request;

  const profileResult = await getUserProfile(token);

  return matchResult(profileResult, {
    ok: (user) => ({ status: 200, body: user }),
    err: (error) => ({ status: error.code, body: { error: error.message } }),
  });
}
```

### Async validation with Result

```typescript
import { ok, err, fromPromise, flatMapResult } from "railway-ts";

type ValidationError = { field: string; message: string };

function validateUsername(username: string): Result<string, ValidationError> {
  if (username.length < 3) {
    return err({ field: "username", message: "Too short" });
  }
  return ok(username);
}

async function checkUsernameAvailable(username: string): Promise<Result<string, ValidationError>> {
  const response = await fromPromise(fetch(`/api/check-username?username=${username}`));

  return flatMapResult(response, async (res) => {
    const data = await res.json();
    return data.available ? ok(username) : err({ field: "username", message: "Already taken" });
  });
}

async function registerUser(username: string) {
  return pipe(
    validateUsername(username),
    (result) => flatMapResult(result, (username) => checkUsernameAvailable(username)),
    // Continue registration process...
  );
}
```

## Examples Documentation

For detailed examples of how to use the library:

- [Option Type Examples](examples/option/OPTION.md) - Working with optional values
- [Result Type Examples](examples/result/RESULT.md) - Error handling with Result

## Tree-Shaking and Module Structure

`railway-ts` is designed to be tree-shakable. Import only what you need:

```typescript
// Import everything with prefixes
import { some, mapOption } from "railway-ts";

// Import directly from modules
import { some, map } from "railway-ts/option";
import { ok, err } from "railway-ts/result";
import { pipe, flow } from "railway-ts/utils";
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Inspired by functional programming concepts from languages like Rust, Scala, F#, and Haskell.
