/**
 * Railway-ts: Functional programming abstractions for TypeScript
 *
 * @module @railway-ts/core
 */

// Re-export core Option types and functions
export type { Option } from "./option";
export {
  some,
  none,
  isSome,
  isNone,
  map as mapOption,
  flatMap as flatMapOption,
  filter as filterOption,
  unwrap as unwrapOption,
  unwrapOr as unwrapOptionOr,
  unwrapOrElse as unwrapOptionOrElse,
  fromNullable as fromNullableOption,
  combine as combineOption,
  match as matchOption,
  tap as tapOption,
  mapToResult,
} from "./option";

// Re-export core Result types and functions
export type { Result } from "./result";
export {
  ok,
  err,
  isOk,
  isErr,
  map as mapResult,
  mapErr as mapErrorResult,
  flatMap as flatMapResult,
  filter as filterResult,
  unwrap as unwrapResult,
  unwrapOr as unwrapResultOr,
  unwrapOrElse as unwrapResultOrElse,
  combine as combineResult,
  combineAll as combineAllResult,
  match as matchResult,
  tap as tapResult,
  tapErr as tapErrorResult,
  mapToOption,
  fromTry,
  fromPromise,
  toPromise,
} from "./result";

// Re-export Utility functions
export { pipe, flow } from "./utils";
