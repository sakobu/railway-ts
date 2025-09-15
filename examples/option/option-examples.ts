import { pipe, fromNullableOption, mapOption, matchOption, unwrapOptionOr } from "@/index";

// Example 1: Safe Property Access
console.log("=== Safe Property Access ===");

type User = { name?: string; email?: string };

// Problem: Nullable properties require defensive coding
const user: User = { name: "Alice" };
// const unsafe = user.email.toLowerCase(); // Runtime error!

// Solution: Option handles nullables safely
const email = pipe(
  fromNullableOption(user.email),
  (opt) => mapOption(opt, (email) => email.toLowerCase()),
  (opt) => unwrapOptionOr(opt, "no-email@example.com"),
);

console.log(email); // "no-email@example.com"

// Example 2: Safe Array Access
console.log("\n=== Safe Array Access ===");

const items = ["apple", "banana"];

// Problem: Array access can return undefined
// const unsafe = items[5].toUpperCase(); // Runtime error!

// Solution: Option makes array access safe
const getItem = (index: number) => fromNullableOption(items[index]);

const item = pipe(
  getItem(5),
  (opt) => mapOption(opt, (item) => item.toUpperCase()),
  (opt) =>
    matchOption(opt, {
      some: (value) => `Found: ${value}`,
      none: () => "Item not found",
    }),
);

console.log(item); // "Item not found"

// Example 3: Configuration Values
console.log("\n=== Configuration Values ===");

const env = { API_URL: "https://api.example.com" };
// LOG_LEVEL is missing

// Problem: Environment variables might be undefined
// const logLevel = process.env.LOG_LEVEL.toLowerCase(); // Might crash

// Solution: Option with sensible defaults
const getConfig = (key: string) => fromNullableOption(env[key as keyof typeof env]);

const logLevel = pipe(
  getConfig("LOG_LEVEL"),
  (opt) => mapOption(opt, (level) => level.toLowerCase()),
  (opt) => unwrapOptionOr(opt, "info"),
);

console.log(`Log level: ${logLevel}`); // "Log level: info"
