# Result Type Examples

This directory contains examples showing how to effectively use the `Result<T, E>` type from @railway-ts/core.

[← Back to main documentation](../../README.md) | [← Option Type Examples](../option/OPTION.md)

## What is Result<T, E>?

`Result<T, E>` represents an operation that might succeed or fail. It's either:

- `Ok(value)` - A successful result containing a value of type T
- `Err(error)` - A failed result containing an error of type E

This provides a type-safe alternative to throwing exceptions.

## Examples

### Basic error handling

```typescript
// Function that might fail
const divide = (a: number, b: number): Result<number, string> => {
  if (b === 0) return err("Division by zero");

  return ok(a / b);
};

// Using the result
const result1 = divide(10, 2);
const result2 = divide(10, 0);

// Pattern matching to handle both cases
console.log(
  match(result1, {
    ok: (value) => `Result: ${value}`,
    err: (error) => `Error: ${error}`,
  }),
);

console.log(
  match(result2, {
    ok: (value) => `Result: ${value}`,
    err: (error) => `Error: ${error}`,
  }),
);
```

### Handling exceptions with fromTry

```typescript
// Use fromTry to convert functions that might throw into Results
const parseJson = (input: string): Result<unknown, Error> => {
  return fromTry(() => JSON.parse(input));
};

const validJson = '{"name": "John", "age": 30}';
const invalidJson = "{name: John}";

console.log(
  match(parseJson(validJson), {
    ok: (data) => `Parsed: ${JSON.stringify(data)}`,
    err: (error) => `Parse error: ${error.message}`,
  }),
);

console.log(
  match(parseJson(invalidJson), {
    ok: (data) => `Parsed: ${JSON.stringify(data)}`,
    err: (error) => `Parse error: ${error.message}`,
  }),
);

// You can also create wrapper functions for any operation that might throw
const tryReadFile = (path: string): Result<string, Error> => {
  return fromTry(() => fs.readFileSync(path, "utf8"));
};

const tryQueryDatabase = <T>(query: string): Result<T[], Error> => {
  return fromTry(() => db.executeQuery(query));
};
```

### Working with async operations using fromPromise

```typescript
// Convert Promise-based APIs to Result
const fetchUser = (id: string): Promise<Result<User, ApiError>> => {
  return fromPromise(
    fetch(`https://api.example.com/users/${id}`).then((res) => {
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json();
    }),
    (error) => ({
      code: 500,
      message: error instanceof Error ? error.message : "Unknown error",
    }),
  );
};

// Usage
const processUser = async (id: string) => {
  const result = await fetchUser(id);

  return match(result, {
    ok: (user) => ({ success: true, data: user }),
    err: (error) => ({ success: false, error: error.message }),
  });
};
```

### Parsing and validation with flatMap

```typescript
// Parse string to number
const parseNumber = (input: string): Result<number, string> => {
  const num = Number(input);
  return Number.isNaN(num) ? err("Invalid number") : ok(num);
};

// Validate age
const validateAge = (age: number): Result<number, string> => {
  return age < 0 ? err("Age cannot be negative") : age > 120 ? err("Age cannot be greater than 120") : ok(age);
};

// Combine functions with pipe and flatMap
const processAge = (input: string): Result<number, string> => {
  return pipe(parseNumber(input), (result) => flatMap(result, validateAge));
};

console.log(
  match(processAge("25"), {
    ok: (age) => `Valid age: ${age}`,
    err: (error) => `Error: ${error}`,
  }),
);

console.log(
  match(processAge("abc"), {
    ok: (age) => `Valid age: ${age}`,
    err: (error) => `Error: ${error}`,
  }),
);
```

### Transforming results with map and mapErr

```typescript
type ValidationError = { field: string; message: string };
type ApiError = { code: number; message: string };

// Transform success value
const normalizeEmail = (email: string): Result<string, ValidationError> => {
  const normalized = email.trim().toLowerCase();

  if (!normalized.includes("@")) {
    return err({ field: "email", message: "Invalid email format" });
  }

  return ok(normalized);
};

// Chain operations and transform errors
const processEmail = (input: string) => {
  return pipe(
    normalizeEmail(input),
    (result) => map(result, (email) => `Processed: ${email}`),
    (result) =>
      mapErr(
        result,
        (error) =>
          ({
            code: 400,
            message: `Validation failed: ${error.message}`,
          }) as ApiError,
      ),
  );
};
```

### Combining multiple Results

```typescript
// Validate form fields
const validateUsername = (username: string): Result<string, string> => {
  return username.length < 3 ? err("Username must be at least 3 characters") : ok(username);
};

const validatePassword = (password: string): Result<string, string> => {
  return password.length < 8 ? err("Password must be at least 8 characters") : ok(password);
};

// Combine results - returns first error or array of values
const validateForm = (username: string, password: string) => {
  return combine([validateUsername(username), validatePassword(password)]);
};

// Combine all results - returns array of all errors or array of values
const validateFormAll = (username: string, password: string) => {
  return combineAll([validateUsername(username), validatePassword(password)]);
};
```

## Benefits of Result

- **No exceptions**: Replace try/catch with type-safe error handling
- **Explicit errors**: Forces you to consider the error case
- **Type-safe errors**: Strong typing for both success and error values
- **Functional composition**: Chain operations with map, flatMap, and pipe
- **Flexible error types**: Use string errors for simple cases or rich error objects for complex scenarios
- **Compatibility with async**: Works seamlessly with Promises via fromPromise

## Available Functions

- Creating results: `ok`, `err`, `fromTry`, `fromPromise`
- Type guards: `isOk`, `isErr`
- Transformations: `map`, `mapErr`, `flatMap`, `filter`
- Unwrapping: `unwrap`, `unwrapOr`, `unwrapOrElse`
- Pattern matching: `match`
- Side effects: `tap`, `tapErr`
- Conversion: `mapToOption`, `toPromise`
- Combination: `combine`, `combineAll`

See the main API documentation for detailed descriptions of each function.
