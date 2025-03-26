import {
  type Result,
  ok,
  err,
  matchResult,
  fromTry,
  pipe,
  flatMapResult,
  combineAllResult,
  fromPromise,
  mapResult,
} from "@/index";

// 1. Basic Error Handling
console.log("\n----- Example 1: Basic Error Handling -----");

// Division function that returns a Result
function divide(a: number, b: number) {
  if (b === 0) return err("Division by zero");
  return ok(a / b);
}

// Example usage
const result1 = divide(10, 2);
const result2 = divide(10, 0);

// Using pattern matching to handle both cases

matchResult(result1, {
  ok: (value) => console.log(`Result: ${value}`),
  err: (error) => console.error(`Error: ${error}`),
}); // "Result: 5"

matchResult(result2, {
  ok: (value) => console.log(`Result: ${value}`),
  err: (error) => console.error(`Error: ${error}`),
}); // "Error: Division by zero"

//2. Handling Exceptions with fromTry
console.log("\n----- Example 2: Handling Exceptions with fromTry -----");

// Convert exception-throwing functions to Result
function parseJson(input: string) {
  return fromTry(() => JSON.parse(input));
}

// Example usage
const validJson = '{"name": "John", "age": 30}';
const invalidJson = "{name: John}";

const result3 = parseJson(validJson);
const result4 = parseJson(invalidJson);

matchResult(result3, {
  ok: (data) => console.log(`Parsed successfully: ${JSON.stringify(data)}`),
  err: (error) => console.error(`Parse error: ${error.message}`),
}); // "Parsed successfully: {"name":"John","age":30}"

matchResult(result4, {
  ok: (data) => console.log(`Parsed successfully: ${JSON.stringify(data)}`),
  err: (error) => console.error(`Parse error: ${error.message}`),
}); // "Parse error: Unexpected token n in JSON at position 1"

// 3. Form Validation with Single Responsibility Validators
console.log("\n----- Example 3: Form Validation with Single Responsibility Validators -----");

// Validation types
type ValidationError = {
  field: string;
  message: string;
};

type FormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

/**
 * Compares two strings in constant time to prevent timing attacks.
 *
 * This function performs a byte-by-byte comparison of the input strings
 * without short-circuiting, ensuring that the execution time depends only
 * on the string length, not on the content. This prevents potential timing
 * attacks when comparing security-sensitive values like passwords or tokens.
 *
 * @param a - The first string to compare
 * @param b - The second string to compare
 * @returns boolean - True if strings are identical, false otherwise
 */
function constantTimeStringCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    const aCode = a.codePointAt(i) ?? 0;
    const bCode = b.codePointAt(i) ?? 0;
    result |= aCode ^ bCode;
  }

  return result === 0;
}

// Single responsibility validators
function validateUsernameRequired(username: string): Result<string, ValidationError> {
  if (!username) {
    return err({ field: "username", message: "Username is required" });
  }
  return ok(username);
}

function validateUsernameLength(username: string): Result<string, ValidationError> {
  if (username.length < 3) {
    return err({ field: "username", message: "Username must be at least 3 characters" });
  }
  return ok(username);
}

function validateEmailRequired(email: string): Result<string, ValidationError> {
  if (!email) {
    return err({ field: "email", message: "Email is required" });
  }
  return ok(email);
}

function validateEmailFormat(email: string): Result<string, ValidationError> {
  if (!email.includes("@")) {
    return err({ field: "email", message: "Email must be valid" });
  }
  return ok(email);
}

function validatePasswordRequired(password: string): Result<string, ValidationError> {
  if (!password) {
    return err({ field: "password", message: "Password is required" });
  }
  return ok(password);
}

function validatePasswordLength(password: string): Result<string, ValidationError> {
  if (password.length < 8) {
    return err({ field: "password", message: "Password must be at least 8 characters" });
  }
  return ok(password);
}

function validatePasswordsMatch(password: string, confirmPassword: string): Result<string, ValidationError> {
  if (!constantTimeStringCompare(password, confirmPassword)) {
    return err({ field: "confirmPassword", message: "Passwords must match" });
  }
  return ok(confirmPassword);
}

// Extracted functions to validate each field completely
function validateUsername(username: string): Result<string, ValidationError> {
  return pipe(validateUsernameRequired(username), (result) => flatMapResult(result, validateUsernameLength));
}

function validateEmail(email: string): Result<string, ValidationError> {
  return pipe(validateEmailRequired(email), (result) => flatMapResult(result, validateEmailFormat));
}

function validatePassword(password: string): Result<string, ValidationError> {
  return pipe(validatePasswordRequired(password), (result) => flatMapResult(result, validatePasswordLength));
}

// Overall form validation - collect all errors
function validateForm(formData: FormData) {
  return combineAllResult([
    validateUsername(formData.username),
    validateEmail(formData.email),
    validatePassword(formData.password),
    validatePasswordsMatch(formData.password, formData.confirmPassword),
  ]);
}

// Example usage
const validForm: FormData = {
  username: "john doe",
  email: "john@example.com",
  password: "password123",
  confirmPassword: "password123",
};

const invalidForm: FormData = {
  username: "jo",
  email: "not-an-email",
  password: "pass",
  confirmPassword: "password",
};

matchResult(validateForm(validForm), {
  ok: () => console.log("Form is valid"),
  err: (errors) => {
    console.error("Validation errors:");
    errors.forEach((error) => {
      console.error(`- ${error.field}: ${error.message}`);
    });
  },
});

matchResult(validateForm(invalidForm), {
  ok: () => console.log("Form is valid"),
  err: (errors) => {
    console.error("Validation errors:");
    errors.forEach((error) => {
      console.error(`- ${error.field}: ${error.message}`);
    });
  },
});

// 4. Async Operations
console.log("\n----- Example 4: Async Operations -----");

// -------- Types --------
type User = {
  id: string;
  name: string;
  role: string;
};

type Permissions = string[];

type UserWithPermissions = {
  user: User;
  permissions: Permissions;
};

// -------- API Layer --------
// Simulated API functions that may throw exceptions
const API = {
  async fetchUserData(userId: string): Promise<User> {
    // Simulating API call
    if (userId === "1") {
      return { id: "1", name: "Alice", role: "admin" };
    }
    throw new Error(`User with id ${userId} not found`);
  },

  async fetchUserPermissions(user: User): Promise<Permissions> {
    // Simulating API call
    if (user.role === "admin") {
      return ["read", "write", "delete", "admin"];
    }
    throw new Error(`Unable to fetch permissions for role ${user.role}`);
  },
};

// -------- Repository Layer --------
// Wrap API calls with Result pattern
const UserRepository = {
  async getUser(userId: string): Promise<Result<User, Error>> {
    return await fromPromise(API.fetchUserData(userId));
  },

  async getPermissions(user: User): Promise<Result<Permissions, Error>> {
    return await fromPromise(API.fetchUserPermissions(user));
  },
};

// -------- Service Layer --------
// Business logic and transformations
const UserService = {
  combineUserAndPermissions(user: User, permissions: Permissions): UserWithPermissions {
    return { user, permissions };
  },

  async getUserPermissions(user: User): Promise<Result<UserWithPermissions, Error>> {
    const permissionsResult = await UserRepository.getPermissions(user);
    return mapResult(permissionsResult, (permissions) => this.combineUserAndPermissions(user, permissions));
  },

  // Main function that chains operations using flatMap
  async getUserWithPermissions(userId: string): Promise<Result<UserWithPermissions, Error>> {
    const userResult = await UserRepository.getUser(userId);

    // Using flatMap pattern to handle the chained operations
    if (!userResult.ok) {
      return userResult;
    }

    return await this.getUserPermissions(userResult.value);
  },
};

// -------- Usage --------
async function main() {
  // Example with successful lookup
  const result1 = await UserService.getUserWithPermissions("1");
  matchResult(result1, {
    ok: (data) => console.log(`User ${data.user.name} has permissions: ${data.permissions.join(", ")}`),
    err: (error) => console.error(`Error: ${error.message}`),
  });

  // Example with error
  const result2 = await UserService.getUserWithPermissions("2");
  matchResult(result2, {
    ok: (data) => console.log(`User ${data.user.name} has permissions: ${data.permissions.join(", ")}`),
    err: (error) => console.error(`Error: ${error.message}`),
  });
}

await main();
