/**
 * Sets of routes for different access levels
 * Using Sets for O(1) lookup performance
 */
export const publicRoutes = new Set([
  "/",
  "/auth/new-verification",
  "/pricing",
  "/terms",
  "/privacy",
  "/about",
])

export const authRoutes = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
])

/**
 * The prefix for API authentication routes
 * These routes will never be blocked
 */
export const apiRoutes = "/api/"

/**
 * The default redirect path after sign-in
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard"
