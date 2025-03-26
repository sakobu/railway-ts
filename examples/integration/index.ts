import {
  type Option,
  type Result,
  some,
  none,
  mapToResult,
  matchResult,
  fromNullableOption,
  err,
  ok,
  pipe,
  flatMapResult,
  fromTry,
  mapErrorResult,
} from "@/index";

// ===== Example 1: Error handling and conversion to Result =====

/**
 * Function that converts an Option to a Result with a custom error
 */
function getRequiredConfig(configOption: Option<string>): Result<string, Error> {
  return mapToResult(configOption, new Error("Required configuration is missing"));
}

const config = some("api-key-123");
const missingConfig = none<string>();

const configResult = getRequiredConfig(config); // ok("api-key-123")
const missingConfigResult = getRequiredConfig(missingConfig); // err(Error("Required configuration is missing"))

matchResult(configResult, {
  ok: (value) => console.log(`Found config: ${value}`),
  err: (error) => console.error(`Error: ${error.message}`),
});

matchResult(missingConfigResult, {
  ok: (value) => console.log(`Found config: ${value}`),
  err: (error) => console.error(`Error: ${error.message}`),
});

// ===== Example 2: User authentication flow combining Option and Result =====

/**
 * This example demonstrates a more complex flow where we:
 * 1. Find a user in the database (returning Option)
 * 2. Validate user credentials (converting to Result)
 * 3. Generate an auth token (which could fail)
 */

// Models
type User = {
  id: string;
  username: string;
  passwordHash: string;
  isActive: boolean;
};

type AuthError =
  | { type: "NOT_FOUND"; message: string }
  | { type: "INVALID_CREDENTIALS"; message: string }
  | { type: "ACCOUNT_INACTIVE"; message: string }
  | { type: "TOKEN_GENERATION_FAILED"; message: string };

type AuthToken = {
  token: string;
  expiresAt: Date;
};

// Mock database
const users: Record<string, User> = {
  user123: {
    id: "user123",
    username: "johndoe",
    passwordHash: "hashed_password123",
    isActive: true,
  },
  user456: {
    id: "user456",
    username: "janedoe",
    passwordHash: "hashed_password456",
    isActive: false,
  },
};

/**
 * Step 1: Find a user by username (returns Option)
 */
function findUserByUsername(username: string): Option<User> {
  const user = Object.values(users).find((u) => u.username === username);
  return fromNullableOption(user);
}

/**
 * Step 2: Validate user credentials and convert to Result
 */
function validateCredentials(user: User, password: string): Result<User, AuthError> {
  // In a real app, you would hash the password and compare
  const isPasswordValid = password === "password123";

  if (!isPasswordValid) {
    return err({
      type: "INVALID_CREDENTIALS",
      message: "Invalid username or password",
    });
  }

  if (!user.isActive) {
    return err({
      type: "ACCOUNT_INACTIVE",
      message: "Account is inactive",
    });
  }

  return ok(user);
}

/**
 * Step 3: Generate auth token (could fail)
 */

// Using calssic try catch

// function generateAuthToken(user: User): Result<AuthToken, AuthError> {
//   try {
//     // Simulate token generation (in real app, this would be more complex)
//     const token = `token_${user.id}_${Date.now()}`;
//     const expiresAt = new Date(Date.now() + 3_600_000); // 1 hour

//     return ok({ token, expiresAt });
//   } catch {
//     return err({
//       type: "TOKEN_GENERATION_FAILED",
//       message: "Failed to generate auth token",
//     });
//   }
// }

// Using Railway-ts

function generateAuthToken(user: User): Result<AuthToken, AuthError> {
  return pipe(
    fromTry(() => {
      // Simulate token generation
      const token = `token_${user.id}_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 3_600_000); // 1 hour

      return { token, expiresAt };
    }),
    // Map the standard Error to our specific AuthError type
    (result) =>
      mapErrorResult(result, () => ({
        type: "TOKEN_GENERATION_FAILED",
        message: "Failed to generate auth token",
      })),
  );
}
/**
 * Main authentication function combining all steps
 */
function authenticateUser(username: string, password: string): Result<AuthToken, AuthError> {
  // First find the user (Option)
  const userOption = findUserByUsername(username);

  // Convert Option to Result with appropriate error
  return pipe(
    mapToResult(userOption, {
      type: "NOT_FOUND",
      message: "User not found",
    } as AuthError),

    // Validate credentials (Result -> Result)
    (result) => flatMapResult(result, (user) => validateCredentials(user, password)),

    // Generate token if validation succeeded (Result -> Result)
    (result) => flatMapResult(result, (user) => generateAuthToken(user)),
  );
}

// Test with existing active user
const successResult = authenticateUser("johndoe", "password123");
matchResult(successResult, {
  ok: (token) => console.log(`Authentication successful! Token: ${token.token}`),
  err: (error) => console.error(`Error: ${error.message} (${error.type})`),
});

// Test with inactive user
const inactiveResult = authenticateUser("janedoe", "password123");
matchResult(inactiveResult, {
  ok: (token) => console.log(`Authentication successful! Token: ${token.token}`),
  err: (error) => console.error(`Error: ${error.message} (${error.type})`),
});

// Test with non-existent user
const notFoundResult = authenticateUser("nonexistent", "password123");
matchResult(notFoundResult, {
  ok: (token) => console.log(`Authentication successful! Token: ${token.token}`),
  err: (error) => console.error(`Error: ${error.message} (${error.type})`),
});
