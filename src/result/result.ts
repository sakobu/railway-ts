import { none, some, type Option } from "@/option";

/**
 * Symbol used to identify Result objects.
 *
 * @internal
 */
export const RESULT_BRAND = Symbol("RESULT_BRAND");

/**
 * Represents a Result type.
 *
 * @example
 * const result: Result<number, string> = ok(123);
 * const error: Result<number, string> = error("An error occurred");
 *
 * @param T - The type of the value contained in the Ok variant
 * @param E - The type of the error contained in the Error variant
 * @returns A Result containing a value or an error
 */
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

/**
 * Creates a Result containing a value.
 *
 * @example
 * const result: Result<number, string> = ok(123);
 *
 * @param value - The value to contain
 * @returns A Result containing the value
 */
export function ok<T, E>(value: T): Result<T, E> {
  return {
    ok: true,
    value,
    [RESULT_BRAND]: "ok",
  };
}

/**
 * Creates a Result containing an error.
 *
 * @example
 * const error: Result<number, string> = err("An error occurred");
 *
 * @param error - The error to contain
 * @returns A Result containing the error
 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error, [RESULT_BRAND]: "error" };
}

/**
 * Type guard that checks if a Result is an Ok variant containing a value.
 *
 * @example
 * const result: Result<number, string> = ok(123);
 * if (isOk(result)) {
 *   // TypeScript knows result.value exists here
 *   console.log(result.value);
 * }
 *
 * @param result - The result to check
 * @returns A type predicate indicating if the result is an Ok variant
 */
export function isOk<T, E>(
  result: Result<T, E>,
): result is {
  readonly ok: true;
  readonly value: T;
  readonly [RESULT_BRAND]: "ok";
} {
  return result.ok;
}

/**
 * Type guard that checks if a Result is an Error variant.
 *
 * @example
 * const result: Result<number, string> = err("error");
 * if (isErr(result)) {
 *   // TypeScript knows result.error exists here
 *   console.log(result.error);
 * }
 *
 * @param result - The result to check
 * @returns A type predicate indicating if the result is an Error variant
 */
export function isErr<T, E>(
  result: Result<T, E>,
): result is {
  readonly ok: false;
  readonly error: E;
  readonly [RESULT_BRAND]: "error";
} {
  return !result.ok;
}

/**
 * Maps the value inside a Result using a transformation function.
 *
 * @example
 * const result: Result<number, string> = ok(123);
 * const transformed: Result<string, string> = map(result, (value) => value.toString());
 *
 * @param result - The Result to transform
 * @param fn - The function to apply to the contained value
 * @returns A new Result containing the transformed value, or the original error if the input was an error
 */
export function map<T, E, U>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

/**
 * Maps the error inside a Result using a transformation function.
 *
 * @example
 * const result: Result<number, string> = err("error");
 * const transformed: Result<number, Error> = mapErr(result, (err) => new Error(err));
 *
 * @param result - The Result to transform
 * @param fn - The function to apply to the contained error
 * @returns A new Result containing the transformed error, or the original value if the input was ok
 */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  return result.ok ? result : err(fn(result.error));
}

/**
 * Maps the value inside a Result using a transformation function that returns a Result.
 *
 * @example
 * const result: Result<number, string> = ok(123);
 * const transformed: Result<string, string> = flatMap(result, (value) => ok(value.toString()));
 *
 * @param result - The Result to transform
 * @param fn - The function to apply to the contained value, returning a Result
 * @returns The Result returned by the transformation function, or the original error if the input was an error
 */
export function flatMap<T, E, U>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}

/**
 * Filters a Result based on a predicate function.
 *
 * @example
 * const result: Result<number, string> = ok(123);
 * const filtered: Result<number, string> = filter(result, value => value > 100, "Value too small"); // still Ok(123)
 * const filtered2: Result<number, string> = filter(result, value => value > 200, "Value too small"); // Err("Value too small")
 *
 * @param result - The Result to filter
 * @param predicate - A function that determines if the value should be kept
 * @param error - The error to return if the predicate fails
 * @returns The original Result if it contains a value that satisfies the predicate, otherwise an Error
 */
export function filter<T, E>(result: Result<T, E>, predicate: (value: T) => boolean, error: E): Result<T, E> {
  return result.ok && predicate(result.value) ? result : err(error);
}

/**
 * Unwraps the value inside a Result, throwing an error if the Result is an error.
 *
 * @remarks
 * This function is intended for prototyping only and should not be used in production.
 * In production code, prefer using pattern matching or `unwrapOr` to handle both Ok and Error cases safely.
 *
 * @example
 * const result: Result<number, string> = ok(123);
 * const value: number = unwrap(result);
 *
 * // With custom error message
 * try {
 *   const badResult: Result<number, string> = err("Invalid data");
 *   unwrap(badResult, "Custom error message");
 * } catch (error) {
 *   // Error will contain "Custom error message" instead of the default
 * }
 *
 * @param result - The Result to unwrap
 * @param errorMsg - Optional custom error message to use if Result is an error
 * @returns The contained value
 * @throws If the Result is an error
 */
export function unwrap<T, E>(result: Result<T, E>, errorMsg?: string): T {
  if (result.ok) {
    return result.value;
  } else {
    throw new Error(errorMsg || `Cannot unwrap an error Result: ${String(result.error)}`);
  }
}

/**
 * Unwraps the value inside a Result, providing a default value if the Result is an error.
 *
 * @example
 * const result: Result<number, string> = err("error");
 * const value: number = unwrapOr(result, 123);
 *
 * @param result - The Result to unwrap
 * @param defaultValue - The value to return if the Result is an error
 * @returns The contained value, or the default value if the Result is an error
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue;
}

/**
 * Unwraps the value inside a Result, calling a function to generate a default value if the Result is an error.
 * Unlike unwrapOr, this only computes the default when needed.
 *
 * @example
 * const result: Result<number, string> = err("error");
 * const value = unwrapOrElse(result, () => expensiveComputation());
 *
 * @param result - The Result to unwrap
 * @param defaultFn - A function that returns a default value if the Result is an error
 * @returns The contained value, or the result of calling defaultFn if the Result is an error
 */
export function unwrapOrElse<T, E>(result: Result<T, E>, defaultFn: () => T): T {
  return result.ok ? result.value : defaultFn();
}

/**
 * Combines an array of Results into a single Result containing an array of values.
 * Returns an Error if any Result in the array is an Error, using the first encountered error.
 * If an empty array is provided, returns `ok([])` (an Ok containing an empty array).
 *
 * @example
 * const results = [ok(1), ok(2), ok(3)];
 * const combined = combine(results); // ok([1, 2, 3])
 *
 * const withError = [ok(1), err("error"), ok(3)];
 * const result = combine(withError); // err("error")
 *
 * const emptyResults = [];
 * const emptyResult = combine(emptyResults); // ok([])
 *
 * @param results - An array of Results to combine
 * @returns A Result containing an array of all values if all inputs are Ok, or the first Error if any input is an Error
 */
export function combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];

  for (const result of results) {
    if (!result.ok) return result;
    values.push(result.value);
  }

  return ok(values);
}

/**
 * Combines an array of Results into a single Result containing an array of values.
 * Unlike combine, this collects all errors instead of returning just the first one.
 * If all Results are Ok, returns an Ok containing an array of all values.
 * If any Results are Error, returns an Error containing an array of all errors.
 *
 * @example
 * const results = [ok(1), ok(2), ok(3)];
 * const combined = combineAll(results); // ok([1, 2, 3])
 *
 * const withErrors = [ok(1), err("error1"), ok(3), err("error2")];
 * const result = combineAll(withErrors); // err(["error1", "error2"])
 *
 * const emptyResults = [];
 * const emptyResult = combineAll(emptyResults); // ok([])
 *
 * @param results - An array of Results to combine
 * @returns A Result containing an array of all values if all inputs are Ok, or an array of all errors if any input is an Error
 */
export function combineAll<T, E>(results: readonly Result<T, E>[]): Result<T[], E[]> {
  const errors: E[] = [];
  const values: T[] = Array.from({ length: results.length });

  for (const [index, result] of results.entries()) {
    if (result.ok) {
      // This is a false positive: `index` is a controlled loop counter (not user input),
      // `values` is a locally-created object in function scope, and this is standard
      // object property assignment. No object injection risk exists here.
      // eslint-disable-next-line security/detect-object-injection
      values[index] = result.value;
    } else {
      errors.push(result.error);
    }
  }

  return errors.length > 0 ? err(errors) : ok(values);
}

/**
 * Pattern matches on a Result to handle both Ok and Error cases.
 *
 * @example
 * const result = ok(42);
 * const message = match(result, {
 *   ok: (value) => `Got value: ${value}`,
 *   err: (error) => `Got error: ${error}`
 * }); // "Got value: 42"
 *
 * @param result - The Result to match against
 * @param patterns - An object containing handler functions for Ok and Error cases
 * @returns The result of calling the appropriate handler function
 */
export function match<T, E, R>(
  result: Result<T, E>,
  patterns: {
    ok: (value: T) => R;
    err: (error: E) => R;
  },
): R {
  if (isOk(result)) {
    const okFn = patterns.ok;
    return okFn(result.value);
  } else {
    const errFn = patterns.err;
    return errFn(result.error);
  }
}

/**
 * Executes a callback with the value if the Result is Ok, without changing the Result.
 * Useful for side effects like logging while maintaining a processing chain.
 *
 * @example
 * const finalResult = pipe(
 *   ok(123),
 *   r => map(r, x => x * 2),
 *   r => tap(r, x => console.log(`Value: ${x}`)), // Logs but doesn't change the Result
 *   r => filter(r, x => x > 200, "Value too small")
 * );
 *
 * @param result - The Result to tap into
 * @param fn - The function to execute with the value if Ok
 * @returns The original Result unchanged
 */
export function tap<T, E>(result: Result<T, E>, fn: (value: T) => void): Result<T, E> {
  if (isOk(result)) {
    const callback = fn;
    callback(result.value);
  }
  return result;
}

/**
 * Executes a callback with the error if the Result is an Error, without changing the Result.
 * Useful for side effects like logging while maintaining a processing chain.
 *
 * @example
 * const finalResult = pipe(
 *   err("something went wrong"),
 *   r => tapErr(r, e => console.error(`Error: ${e}`)), // Logs but doesn't change the Result
 *   r => mapErr(r, e => new Error(e))
 * );
 *
 * @param result - The Result to tap into
 * @param fn - The function to execute with the error if Error
 * @returns The original Result unchanged
 */
export function tapErr<T, E>(result: Result<T, E>, fn: (error: E) => void): Result<T, E> {
  if (isErr(result)) {
    const callback = fn;
    callback(result.error);
  }
  return result;
}

/**
 * Converts a Result to an Option.
 * If the Result is Ok, returns a Some variant with the value.
 * If the Result is an Error, returns a None variant.
 *
 * @example
 * import { some, none } from "@/option";
 *
 * const option1 = mapToOption(ok(123)); // some(123)
 * const option2 = mapToOption(err("error")); // none()
 *
 * @param result - The Result to convert
 * @returns An Option containing the value if Ok, or None if Error
 */
export function mapToOption<T, E>(result: Result<T, E>): Option<T> {
  return result.ok ? some(result.value) : none();
}

/**
 * Safely executes a function that might throw and converts the result into a Result type.
 * If the function executes successfully, returns an Ok variant with the return value.
 * If the function throws an error, returns an Error variant containing the caught error.
 *
 * @example
 * const parseJson = (str: string) => fromTry(() => JSON.parse(str));
 *
 * const validResult = parseJson('{"name":"John"}'); // ok({ name: 'John' })
 * const invalidResult = parseJson('invalid json'); // err(SyntaxError: Unexpected token...)
 *
 * @param f - The function to execute
 * @returns A Result containing either the function's return value or the caught error
 */
export function fromTry<T>(f: () => T): Result<T, Error> {
  try {
    return ok(f());
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Converts a Promise to a Result, capturing any errors that occur during promise resolution.
 *
 * @remarks
 * This function wraps promise execution in a try/catch block and returns a Result type. When the promise
 * resolves successfully, it returns an Ok variant with the resolved value. When the promise rejects,
 * it catches the error and returns an Error variant.
 *
 * For proper type safety, if you specify a particular error type E that's not 'unknown',
 * you should provide an error transformation function to ensure the caught error
 * is properly converted to your expected error type.
 *
 * @example
 * // Basic usage with default error handling
 * const result = await fromPromise(fetch('https://api.example.com/data'));
 *
 * @example
 * // With specific error type and transformer
 * type ApiError = { code: number; message: string };
 *
 * const result = await fromPromise<Response, ApiError>(
 *   fetch('https://api.example.com/data'),
 *   (error) => ({
 *     code: error instanceof Error ? 500 : 400,
 *     message: error instanceof Error ? error.message : String(error)
 *   })
 * );
 *
 * @param promise - The Promise to convert
 * @param errorFn - Optional function to transform caught errors to the expected error type
 * @returns A Promise that resolves to a Result
 */
export async function fromPromise<T, E = unknown>(
  promise: Promise<T>,
  errorFn: (error: unknown) => E = (error) => error as unknown as E,
): Promise<Result<T, E>> {
  try {
    const value = await promise;
    return ok(value);
  } catch (error) {
    return err(errorFn(error));
  }
}

/**
 * Converts a Result to a Promise.
 *
 * @example
 * const result = ok(123);
 * const promise = toPromise(result);
 * const value = await promise; // 123
 *
 * @param result - The Result to convert
 * @returns A Promise that resolves to the value if Ok, or rejects with the error if Error
 */
export function toPromise<T, E>(result: Result<T, E>): Promise<T> {
  return result.ok ? Promise.resolve(result.value) : Promise.reject(result.error);
}
