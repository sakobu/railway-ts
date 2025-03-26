# Option Type Examples

This directory contains examples showing how to effectively use the `Option<T>` type from railway-ts.

[← Back to main documentation](../../README.md) | [Result Type Examples →](../result/RESULT.md)

## What is Option<T>?

`Option<T>` represents a value that may or may not exist. It's either:

- `Some(value)` - Contains a value of type T
- `None` - Contains no value

This provides a type-safe alternative to using `null` or `undefined`.

## Examples

### Converting from nullable values

When interfacing with external APIs that use nullable types:

```typescript
// External API interface with optional properties
type User = {
  name?: string;
  age?: number;
};

const completeUser: User = { name: "Alice", age: 30 };
const partialUser: User = { name: "Bob" };
const emptyUser: User = {};

// Convert potentially undefined properties to Options
const getUserName = (user: User): Option<string> => fromNullable(user.name);
const getUserAge = (user: User): Option<number> => fromNullable(user.age);

// Fake heavy computation callback example
const heavyComputation = () => 30;

console.log("Complete user name:", unwrapOr(getUserName(completeUser), "Unknown"));
console.log("Partial user age:", unwrapOr(getUserAge(partialUser), 0));
console.log("Empty user age:", unwrapOrElse(getUserAge(emptyUser), heavyComputation));
```

### Using Option directly in your types

When designing new interfaces, use Option type directly:

```typescript
type Config = {
  port: number;
  logLevel: string;
  adminEmail: Option<string>; // Optional, some if present, none if missing
};

const config: Config = {
  port: 8080,
  logLevel: "INFO",
  adminEmail: none(),
};

const config2: Config = {
  port: 8080,
  logLevel: "INFO",
  adminEmail: some("admin@example.com"),
};

// Type guards for prototyping
if (isSome(config.adminEmail)) {
  console.log("Config:", config.adminEmail.value);
}

if (isNone(config.adminEmail)) {
  console.log("Config:", "No admin email");
}
```

### Pattern matching with match

Elegantly handle both Some and None cases:

```typescript
// Pattern matching to get the value
const result = match(config.adminEmail, {
  some: (value) => `Got ${value}`,
  none: () => "Nothing here",
});

console.log("Result:", result);
```

### Transforming with map and pipe

Chain operations to transform Option values:

```typescript
// Transform the value until you unwrap it for the final result
const result2 = pipe(
  config2.adminEmail,
  (opt) => map(opt, (email) => email.toUpperCase()),
  (opt) => unwrapOr(opt, "NO ADMIN EMAIL"),
);

console.log("Result2:", result2);
```

### Chaining operations with flatMap

Use flatMap when transformations return Option types:

```typescript
const result3 = pipe(
  config2.adminEmail,
  (opt) => flatMap(opt, (email) => some(email.toUpperCase())),
  (opt) => unwrapOr(opt, "NO ADMIN EMAIL"),
);

console.log("Result3:", result3);
```

## Benefits of Option

- **No more null checks**: Type guards and pattern matching replace error-prone null checks
- **Explicit optionality**: Makes optional values explicit in your type signatures
- **Functional composition**: Chain transformations with map, flatMap and pipe
- **Default value handling**: Elegant fallbacks with unwrapOr and unwrapOrElse
- **Type-safety**: Compiler enforces handling of missing values

## Available Functions

- Creating options: `some`, `none`, `fromNullable`
- Type guards: `isSome`, `isNone`
- Transformations: `map`, `flatMap`, `filter`
- Unwrapping: `unwrap`, `unwrapOr`, `unwrapOrElse`
- Pattern matching: `match`
- Side effects: `tap`
- Conversion: `mapToResult`
- Combination: `combine`

See the main API documentation for detailed descriptions of each function.
