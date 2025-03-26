import {
  type Option,
  fromNullableOption,
  mapOption,
  filterOption,
  matchOption,
  pipe,
  unwrapOptionOr,
  flatMapOption,
  some,
  none,
  flow,
} from "@/index";

// 1. User Input Validation
console.log("\n----- Example 1: User Input Validation -----");

// Validate user input for email address
function validateEmail(input: string | null | undefined) {
  return pipe(
    fromNullableOption(input),
    (opt) => mapOption(opt, (email) => email.trim().toLowerCase()),
    (opt) => filterOption(opt, (email) => email.includes("@") && email.includes(".")),
  );
}

// Example usage
const validEmail = validateEmail("user@example.com");
const invalidEmail = validateEmail("invalid-email");
const missingEmail = validateEmail(null);

// Get user-friendly messages using pattern matching
function getEmailMessage(emailOpt: Option<string>) {
  return matchOption(emailOpt, {
    some: (email) => `Valid email: ${email}`,
    none: () => "Please provide a valid email address",
  });
}

console.log(getEmailMessage(validEmail)); // "Valid email: user@example.com"
console.log(getEmailMessage(invalidEmail)); // "Please provide a valid email address"
console.log(getEmailMessage(missingEmail)); // "Please provide a valid email address"

// 2. Safe Property Access
console.log("\n----- Example 2: Safe Property Access -----");

// Type definitions
type Address = {
  street?: string;
  city?: string;
  zipCode?: string;
};

type User = {
  id: string;
  name: string;
  address?: Address;
};

// Example data
const users: Record<string, User> = {
  "1": { id: "1", name: "Alice", address: { street: "123 Main St", city: "Boston", zipCode: "02108" } },
  "2": { id: "2", name: "Bob", address: { street: "456 Oak Ave", city: "Chicago" } },
  "3": { id: "3", name: "Charlie" },
};

// Safe property access with Option
function getZipCode(userId: string) {
  const user = users[userId];
  return pipe(
    fromNullableOption(user),
    (userOpt) => mapOption(userOpt, (user) => user.address),
    (addressOpt) => flatMapOption(addressOpt, (maybeAddress) => fromNullableOption(maybeAddress)),
    (addressOpt) => flatMapOption(addressOpt, (address) => fromNullableOption(address.zipCode)),
  );
}
// Default values with unwrapOr
function getFormattedZipCode(userId: string) {
  const zipCodeOpt = getZipCode(userId);
  return unwrapOptionOr(zipCodeOpt, "No zip code available");
}

// Usage
console.log(getFormattedZipCode("1")); // "02108"
console.log(getFormattedZipCode("2")); // "No zip code available"
console.log(getFormattedZipCode("3")); // "No zip code available"
console.log(getFormattedZipCode("4")); // "No zip code available"

// 3. Database Query Simulation
console.log("\n----- Example 3: Database Query Simulation -----");

// User type
type User2 = {
  id: string;
  name: string;
  email?: string;
  role?: string;
};

// Simulated database
const usersDB: Record<string, User2> = {
  "1": { id: "1", name: "Alice", email: "alice@example.com", role: "admin" },
  "2": { id: "2", name: "Bob", email: "bob@example.com", role: "user" },
};

// Simulated database functions
function findUserById(id: string): Option<User2> {
  const user = usersDB[id];
  return user ? some(user) : none();
}

// Building complex queries with Option
const getUserProfile = flow(
  (id: string): Option<User2> => findUserById(id),
  (userOpt: Option<User2>) =>
    mapOption(userOpt, (user: User2) => ({
      ...user,
      displayName: user.name,
      accountStatus: "Active",
    })),
);

// Rendering UI based on query results
function renderUserProfile(id: string) {
  const profileOpt = getUserProfile(id);

  return matchOption(profileOpt, {
    some: (profile) => ({
      title: `Profile: ${profile.displayName}`,
      content: `User ID: ${profile.id}, Status: ${profile.accountStatus}`,
      showEditButton: true,
    }),
    none: () => ({
      title: "User Not Found",
      content: "The requested user profile could not be found.",
      showEditButton: false,
    }),
  });
}

// Usage
console.log(renderUserProfile("1")); // Found user profile
console.log(renderUserProfile("999")); // Not found

// 4. Configuration Management
console.log("\n----- Example 4: Configuration Management -----");

// Simulating environment variables
const env: Record<string, string | undefined> = {
  API_KEY: "abc123",
  // LOG_LEVEL is intentionally not set
  MAX_CONNECTIONS: "50",
};

// Type-safe configuration with optional values
type AppConfig = {
  port: number;
  host: string;
  apiKey: Option<string>;
  logLevel: Option<string>;
  maxConnections: Option<number>;
};

// Create config with explicit optionals
const config: AppConfig = {
  port: 3000,
  host: "localhost",
  apiKey: fromNullableOption(env["API_KEY"]),
  logLevel: fromNullableOption(env["LOG_LEVEL"]),
  maxConnections: pipe(fromNullableOption(env["MAX_CONNECTIONS"]), (opt) => mapOption(opt, (val) => parseInt(val, 10))),
};

// Function to get config values with defaults
function getLogLevel(config: AppConfig) {
  return unwrapOptionOr(config.logLevel, "info");
}

function getMaxConnections(config: AppConfig) {
  return unwrapOptionOr(config.maxConnections, 10);
}

// Validate API configuration
function validateApiConfig(config: AppConfig) {
  return matchOption(config.apiKey, {
    some: () => ({ valid: true, message: "API configured correctly" }),
    none: () => ({ valid: false, message: "Missing API key in configuration" }),
  });
}

// Usage
console.log(getLogLevel(config)); // "info" (default value)
console.log(getMaxConnections(config)); // 50 (from environment)
console.log(validateApiConfig(config)); // { valid: true, message: "API configured correctly" }

// 5. Functional Workflow with Option
console.log("\n----- Example 5: Functional Workflow with Option -----");

// Domain types
type User3 = {
  id: string;
  name: string;
  role: string;
};

type Permission = "read" | "write" | "delete" | "admin";

// Mock database
const usersDB2: Record<string, User3> = {
  "1": { id: "1", name: "Alice", role: "admin" },
  "2": { id: "2", name: "Bob", role: "user" },
};

const rolePermissions: Record<string, Permission[]> = {
  admin: ["read", "write", "delete", "admin"],
  user: ["read", "write"],
};

// Domain operations
function findUser(id: string) {
  return fromNullableOption(usersDB2[id]);
}

function getPermissions(user: User3) {
  return fromNullableOption(rolePermissions[user.role]);
}

function checkPermission(permissions: Permission[], requiredPermission: Permission) {
  return permissions.includes(requiredPermission) ? some(permissions) : none();
}

// Authorization workflow using flatMap for composing Option-returning functions
function authorizeAction(userId: string, requiredPermission: Permission) {
  return pipe(
    findUser(userId),
    (userOpt) => flatMapOption(userOpt, (user) => getPermissions(user)),
    (permsOpt) => flatMapOption(permsOpt, (perms) => checkPermission(perms, requiredPermission)),
  );
}

// Convenience function using flow
const canPerformAdminAction = flow(
  (userId: string) => authorizeAction(userId, "admin"),
  (opt) =>
    matchOption(opt, {
      some: () => true,
      none: () => false,
    }),
);

// Usage
function performAdminAction(userId: string) {
  const authorized = authorizeAction(userId, "admin");

  return matchOption(authorized, {
    some: () => ({ success: true, message: "Admin action performed successfully" }),
    none: () => ({ success: false, message: "Not authorized to perform admin actions" }),
  });
}

console.log(performAdminAction("1")); // Success - user is admin
console.log(performAdminAction("2")); // Failure - user is not admin
console.log(performAdminAction("3")); // Failure - user doesn't exist

console.log(canPerformAdminAction("1")); // true
console.log(canPerformAdminAction("2")); // false
