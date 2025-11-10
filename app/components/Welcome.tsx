"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/routes";
import type { User } from "@supabase/supabase-js";

interface ServiceStatus {
  name: string;
  status: "healthy" | "unhealthy";
  message?: string;
}

interface HomeClientProps {
  initialStatus: {
    overall: string;
    healthyCount: number;
    totalCount: number;
    services: ServiceStatus[];
  };
  dashboardUsername: string;
  dashboardPassword: string;
  supabaseUrl: string;
}

export function Welcome({
  initialStatus,
  dashboardUsername,
  dashboardPassword,
  supabaseUrl,
}: HomeClientProps) {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [apiWorking, setApiWorking] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Check if API works
  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch("/api/status");
        if (response.ok) {
          const data = await response.json();
          setApiWorking(data.success === true);
        } else {
          setApiWorking(false);
        }
      } catch (error) {
        console.error("Error checking API:", error);
        setApiWorking(false);
      }
    };

    checkApi();
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      // Clear user state immediately to prevent UI flicker
      setUser(null);

      // Sign out from Supabase (clears session and cookies)
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        setIsSigningOut(false);
        return;
      }

      // Clear any remaining cookies manually as a safety measure
      // This ensures all auth-related cookies are removed
      const cookies = document.cookie.split(";");
      cookies.forEach((c) => {
        const cookieName = c.trim().split("=")[0];
        if (
          cookieName.includes("sb-") ||
          cookieName.includes("auth") ||
          cookieName.includes("supabase")
        ) {
          // Clear for all possible paths and domains
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
        }
      });

      // Wait a moment to ensure sign out completes and cookies are cleared
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verify session is actually cleared
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // If session still exists, force clear it
        await supabase.auth.signOut();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Force a hard redirect to home to ensure clean state
      // Using replace to prevent back button from going to dashboard
      window.location.replace(ROUTES.HOME);
    } catch (err) {
      console.error("Sign out error:", err);
      // Even on error, try to redirect to home
      window.location.replace(ROUTES.HOME);
    }
  };

  if (loading) {
    return (
      <main className="py-12 px-6 max-w-6xl mx-auto bg-white">
        <div className="text-center">Loading...</div>
      </main>
    );
  }

  return (
    <main className="py-12 px-6 max-w-6xl mx-auto bg-white">
      <div className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold mb-2 text-stripe-dark tracking-tight">
            SupaNext
          </h1>
          <p className="text-sm text-stripe-gray leading-normal">
            Next.js + Supabase
          </p>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href={ROUTES.DASHBOARD}
                className="px-4 py-2 text-sm font-medium text-stripe-dark bg-white border border-stripe-border rounded-md hover:bg-stripe-bg focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:ring-offset-2 transition-colors"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="px-4 py-2 text-sm font-medium text-stripe-dark bg-white border border-stripe-border rounded-md hover:bg-stripe-bg focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <Link
                href={ROUTES.LOGIN}
                className="px-4 py-2 text-sm font-medium text-stripe-dark bg-white border border-stripe-border rounded-md hover:bg-stripe-bg focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:ring-offset-2 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href={ROUTES.SIGNUP}
                className="px-4 py-2 text-sm font-medium text-white bg-stripe-purple border border-transparent rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:ring-offset-2 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column - Services Status */}
        <div className="p-5 bg-white border border-stripe-border rounded-md flex flex-col">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-stripe-border">
            <h2 className="text-sm font-semibold text-stripe-dark m-0">
              Services
            </h2>
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${
                initialStatus.overall === "healthy"
                  ? "text-stripe-green bg-stripe-green-bg"
                  : initialStatus.overall === "degraded"
                  ? "text-stripe-yellow bg-stripe-yellow-bg"
                  : "text-stripe-red bg-stripe-red-bg"
              }`}
            >
              {initialStatus.healthyCount}/{initialStatus.totalCount}
            </span>
          </div>

          <div className="space-y-3">
            {initialStatus.services.map((service: ServiceStatus) => (
              <div
                key={service.name}
                className="flex justify-between items-start py-3 border-b border-stripe-bg last:border-0"
              >
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-stripe-dark mb-1">
                    {service.name}
                  </div>
                  {service.message && (
                    <div className="text-xs text-stripe-gray leading-snug">
                      {service.message}
                    </div>
                  )}
                </div>
                <span
                  className={`text-sm font-medium ml-4 ${
                    service.status === "healthy"
                      ? "text-stripe-green"
                      : "text-stripe-red"
                  }`}
                >
                  {service.status === "healthy" ? "●" : "○"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Supabase Studio & Next Steps */}
        <div className="flex flex-col gap-6">
          <div className="p-5 bg-white border border-stripe-border rounded-md flex-1">
            <h2 className="text-sm font-semibold text-stripe-dark mb-4">
              Supabase Studio
            </h2>
            <div className="mb-4 p-3 bg-stripe-bg rounded border border-stripe-border">
              <div className="text-xs text-stripe-gray mb-2">
                Default credentials
              </div>
              <div className="text-[13px] text-stripe-dark leading-relaxed">
                <div className="mb-1">
                  <strong>URL:</strong>{" "}
                  <a
                    href={supabaseUrl}
                    target="_blank"
                    className="text-stripe-purple"
                  >
                    {supabaseUrl}
                  </a>
                </div>
                <div className="mb-1">
                  <strong>Username:</strong> <code>{dashboardUsername}</code>
                </div>
                <div>
                  <strong>Password:</strong> <code>{dashboardPassword}</code>
                </div>
              </div>
            </div>
            <div className="text-xs text-stripe-yellow px-3 py-2 bg-stripe-yellow-bg rounded border border-yellow-200">
              ⚠️ Change these credentials in <code>.env</code> before deploying
              to production
            </div>
          </div>

          <div className="p-5 bg-white border border-stripe-border rounded-md flex-1">
            <h2 className="text-sm font-semibold text-stripe-dark mb-4">
              {user ? "Authentication" : "Next steps"}
            </h2>
            {user ? (
              <div className="space-y-3">
                <div className="p-3 bg-stripe-green-bg rounded border border-stripe-green">
                  <div className="text-xs text-stripe-green font-medium mb-1">
                    ✓ Authenticated
                  </div>
                  <div className="text-[13px] text-stripe-dark">
                    Signed in as <strong>{user.email}</strong>
                  </div>
                </div>
                <div className="text-[13px] text-stripe-dark leading-relaxed">
                  <p className="mb-2">
                    You can now access protected routes like the{" "}
                    <Link
                      href={ROUTES.DASHBOARD}
                      className="text-stripe-purple"
                    >
                      dashboard
                    </Link>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <ol className="pl-5 text-[13px] text-stripe-dark leading-relaxed">
                <li className="mb-2">
                  <Link href={ROUTES.SIGNUP} className="text-stripe-purple">
                    Create an account
                  </Link>{" "}
                  or{" "}
                  <Link href={ROUTES.LOGIN} className="text-stripe-purple">
                    sign in
                  </Link>
                </li>
                <li className="mb-2">
                  Log in to Supabase Studio using the credentials above
                </li>
                <li className="mb-2">Create your database tables</li>
                <li>Start building your app</li>
              </ol>
            )}
          </div>

          {/* API Status */}
          <div className="p-5 bg-white border border-stripe-border rounded-md flex-1">
            <h2 className="text-sm font-semibold text-stripe-dark mb-4">
              API Status
            </h2>
            <div className="p-3 bg-stripe-bg rounded border border-stripe-border">
              {apiWorking ? (
                <div className="flex items-center gap-2">
                  <span className="text-stripe-green text-sm">●</span>
                  <span className="text-sm text-stripe-dark">
                    API is working
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-stripe-gray text-sm">○</span>
                  <span className="text-sm text-stripe-gray">
                    Checking API...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
