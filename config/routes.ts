/**
 * Route Configuration
 * 
 * Centralized route definitions for the application.
 * This is the single source of truth for all route constants.
 */

/**
 * Routes that require authentication
 */
export const PROTECTED_ROUTES = [
  "/onboarding",
  "/home",
  "/Practice",
  "/community",
  "/profile",
  "/progress",
  "/quiz",
  "/listening",
  "/listening-quiz",
  "/call",
  "/chat",
  "/topics",
  "/report",
  "/todays-report",
] as const;

/**
 * Routes that require both authentication AND onboarding completion
 */
export const ONBOARDING_REQUIRED_ROUTES = [
  "/home",
  "/Practice",
  "/community",
  "/profile",
  "/progress",
  "/quiz",
  "/listening",
  "/listening-quiz",
  "/call",
  "/chat",
  "/topics",
  "/report",
  "/todays-report",
] as const;

/**
 * Routes that require conversation experience (after onboarding)
 */
export const CONVERSATION_EXPERIENCE_REQUIRED_ROUTES = [
  "/home",
  "/Practice",
  "/community",
  "/profile",
  "/progress",
  "/quiz",
  "/listening",
  "/listening-quiz",
  "/chat",
  "/topics",
  "/todays-report",
] as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/privacy",
  "/terms",
  "/refund",
  "/checkout",
  "/payment-success",
  "/payment-failed",
  "/payment-cancel",
  "/about-desktop",
  "/instructions-desktop",
] as const;

/**
 * Admin routes
 */
export const ADMIN_ROUTES = [
  "/admin",
  "/admin/login",
  "/admin/register",
] as const;

/**
 * Payment and subscription related routes (accessible even if subscription not completed)
 */
export const PAYMENT_ROUTES = [
  "/upgrade",
  "/checkout",
  "/payment-success",
  "/payment-failed",
  "/payment-cancel",
  "/free-trial",
  "/free-trial-success",
] as const;

/**
 * Type helpers for route arrays
 */
export type ProtectedRoute = typeof PROTECTED_ROUTES[number];
export type OnboardingRequiredRoute = typeof ONBOARDING_REQUIRED_ROUTES[number];
export type ConversationExperienceRequiredRoute = typeof CONVERSATION_EXPERIENCE_REQUIRED_ROUTES[number];
export type PublicRoute = typeof PUBLIC_ROUTES[number];
export type AdminRoute = typeof ADMIN_ROUTES[number];
export type PaymentRoute = typeof PAYMENT_ROUTES[number];

/**
 * Helper function to check if a route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.includes(pathname as ProtectedRoute);
}

/**
 * Helper function to check if a route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname as PublicRoute);
}

/**
 * Helper function to check if a route requires onboarding
 */
export function requiresOnboarding(pathname: string): boolean {
  return ONBOARDING_REQUIRED_ROUTES.includes(pathname as OnboardingRequiredRoute);
}

/**
 * Helper function to check if a route requires conversation experience
 */
export function requiresConversationExperience(pathname: string): boolean {
  return CONVERSATION_EXPERIENCE_REQUIRED_ROUTES.includes(pathname as ConversationExperienceRequiredRoute);
}

/**
 * Helper function to check if a route is a payment route
 */
export function isPaymentRoute(pathname: string): boolean {
  return PAYMENT_ROUTES.includes(pathname as PaymentRoute);
}
