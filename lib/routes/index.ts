/**
 * Routing Control Center - Main Export
 *
 * Centralized routing configuration and utilities
 */

export * from "./config";
export * from "./navigation";

// Re-export for convenience
export { ROUTES } from "./config";
export type { Route, RouteConfig } from "./config";
