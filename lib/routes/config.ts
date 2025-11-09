/**
 * Routing Control Center
 * Centralized configuration for all application routes
 */

export const ROUTES = {
  // Public routes
  HOME: "/",
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  FORGOT_PASSWORD: "/auth/forgot-password",

  // Protected routes
  DASHBOARD: "/dashboard",

  // Auth callbacks
  AUTH_CALLBACK: "/auth/callback",
  AUTH_RESET_PASSWORD: "/auth/reset-password",

  // API routes
  API_HEALTH: "/api/health",
  API_SUPABASE_STATUS: "/api/supabase-status",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Route metadata and configuration
 */
export interface RouteConfig {
  path: Route;
  label: string;
  requiresAuth: boolean;
  requiresGuest?: boolean; // If true, redirects authenticated users away
  redirectTo?: Route; // Where to redirect if access is denied
  meta?: {
    title?: string;
    description?: string;
    roles?: string[]; // Future: role-based access
  };
}

export const ROUTE_CONFIG: Record<Route, RouteConfig> = {
  [ROUTES.HOME]: {
    path: ROUTES.HOME,
    label: "Home",
    requiresAuth: false,
    meta: {
      title: "SupaNext - Home",
      description: "Next.js + Supabase Boilerplate",
    },
  },
  [ROUTES.LOGIN]: {
    path: ROUTES.LOGIN,
    label: "Sign In",
    requiresAuth: false,
    requiresGuest: true,
    redirectTo: ROUTES.DASHBOARD,
    meta: {
      title: "Sign In",
      description: "Sign in to your account",
    },
  },
  [ROUTES.SIGNUP]: {
    path: ROUTES.SIGNUP,
    label: "Sign Up",
    requiresAuth: false,
    requiresGuest: true,
    redirectTo: ROUTES.DASHBOARD,
    meta: {
      title: "Create Account",
      description: "Create a new account",
    },
  },
  [ROUTES.FORGOT_PASSWORD]: {
    path: ROUTES.FORGOT_PASSWORD,
    label: "Forgot Password",
    requiresAuth: false,
    meta: {
      title: "Reset Password",
      description: "Reset your password",
    },
  },
  [ROUTES.DASHBOARD]: {
    path: ROUTES.DASHBOARD,
    label: "Dashboard",
    requiresAuth: true,
    redirectTo: ROUTES.LOGIN,
    meta: {
      title: "Dashboard",
      description: "User dashboard",
    },
  },
  [ROUTES.AUTH_CALLBACK]: {
    path: ROUTES.AUTH_CALLBACK,
    label: "Auth Callback",
    requiresAuth: false,
    meta: {
      title: "Authenticating...",
    },
  },
  [ROUTES.AUTH_RESET_PASSWORD]: {
    path: ROUTES.AUTH_RESET_PASSWORD,
    label: "Reset Password",
    requiresAuth: true,
    redirectTo: ROUTES.LOGIN,
    meta: {
      title: "Reset Password",
      description: "Set your new password",
    },
  },
  [ROUTES.API_HEALTH]: {
    path: ROUTES.API_HEALTH,
    label: "Health Check",
    requiresAuth: false,
  },
  [ROUTES.API_SUPABASE_STATUS]: {
    path: ROUTES.API_SUPABASE_STATUS,
    label: "Supabase Status",
    requiresAuth: false,
  },
};

/**
 * Get route configuration by path
 */
export function getRouteConfig(path: string): RouteConfig | undefined {
  return Object.values(ROUTE_CONFIG).find((config) => config.path === path);
}

/**
 * Check if a route requires authentication
 */
export function requiresAuth(path: string): boolean {
  const config = getRouteConfig(path);
  return config?.requiresAuth ?? false;
}

/**
 * Check if a route requires guest (not authenticated)
 */
export function requiresGuest(path: string): boolean {
  const config = getRouteConfig(path);
  return config?.requiresGuest ?? false;
}

/**
 * Get redirect path for a route
 */
export function getRedirectPath(
  path: string,
  isAuthenticated: boolean
): Route | null {
  const config = getRouteConfig(path);

  if (!config) return null;

  // If route requires auth and user is not authenticated
  if (config.requiresAuth && !isAuthenticated) {
    return config.redirectTo || ROUTES.LOGIN;
  }

  // If route requires guest and user is authenticated
  if (config.requiresGuest && isAuthenticated) {
    return config.redirectTo || ROUTES.DASHBOARD;
  }

  return null;
}

/**
 * Get all protected routes
 */
export function getProtectedRoutes(): Route[] {
  return Object.values(ROUTE_CONFIG)
    .filter((config) => config.requiresAuth)
    .map((config) => config.path);
}

/**
 * Get all public routes
 */
export function getPublicRoutes(): Route[] {
  return Object.values(ROUTE_CONFIG)
    .filter((config) => !config.requiresAuth)
    .map((config) => config.path);
}
