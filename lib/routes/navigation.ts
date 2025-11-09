/**
 * Navigation utilities
 * Client-side navigation helpers using the routing config
 */

"use client";

import { useRouter, usePathname } from "next/navigation";
import { ROUTES, getRouteConfig, getRedirectPath, type Route } from "./config";
import { createClientComponentClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

/**
 * Hook for navigation with auth checks
 */
export function useAuthNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  /**
   * Navigate to a route with automatic auth checks
   */
  const navigate = async (path: Route, options?: { replace?: boolean }) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const isAuth = !!session;

    const redirectPath = getRedirectPath(path, isAuth);

    if (redirectPath) {
      const finalPath =
        redirectPath === ROUTES.LOGIN
          ? `${ROUTES.LOGIN}?redirectTo=${encodeURIComponent(path)}`
          : redirectPath;

      if (options?.replace) {
        window.location.replace(finalPath);
      } else {
        router.push(finalPath);
      }
      return;
    }

    if (options?.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  };

  /**
   * Navigate to a route with hard reload (for auth state changes)
   */
  const navigateWithReload = async (path: Route) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const isAuth = !!session;

    const redirectPath = getRedirectPath(path, isAuth);

    if (redirectPath) {
      const finalPath =
        redirectPath === ROUTES.LOGIN
          ? `${ROUTES.LOGIN}?redirectTo=${encodeURIComponent(path)}`
          : redirectPath;
      window.location.href = finalPath;
      return;
    }

    window.location.href = path;
  };

  /**
   * Check if current route is accessible
   */
  const checkRouteAccess = async (): Promise<boolean> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const isAuth = !!session;

    const redirectPath = getRedirectPath(pathname as Route, isAuth);
    return !redirectPath;
  };

  return {
    navigate,
    navigateWithReload,
    checkRouteAccess,
    isAuthenticated,
    currentPath: pathname,
  };
}

/**
 * Simple navigation helper (no auth checks)
 */
export function useNavigation() {
  const router = useRouter();

  const goTo = (path: Route, options?: { replace?: boolean }) => {
    if (options?.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  };

  const goBack = () => {
    router.back();
  };

  const goForward = () => {
    router.forward();
  };

  const reload = () => {
    router.refresh();
  };

  return {
    goTo,
    goBack,
    goForward,
    reload,
  };
}

/**
 * Get route metadata for current page
 */
export function useRouteMetadata() {
  const pathname = usePathname();
  const config = getRouteConfig(pathname);

  return {
    config,
    title: config?.meta?.title,
    description: config?.meta?.description,
    label: config?.label,
  };
}
