import { createServerComponentClient } from "@/lib/supabase/server";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { ROUTES } from "@/lib/routes";

interface ServiceStatus {
  name: string;
  status: "healthy" | "unhealthy";
  message?: string;
}

const getInternalUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:8000";
  return url
    .replace("localhost:8000", "kong:8000")
    .replace("127.0.0.1:8000", "kong:8000");
};

const checkHttpService = async (
  path: string,
  name: string,
  successCodes: number[] = [200, 401, 404]
): Promise<ServiceStatus> => {
  try {
    const response = await fetch(`${getInternalUrl()}${path}`, {
      method: "GET",
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "" },
    });
    const isHealthy = successCodes.includes(response.status) || response.ok;
    return {
      name,
      status: isHealthy ? "healthy" : "unhealthy",
      message: isHealthy ? "Service responding" : `HTTP ${response.status}`,
    };
  } catch (err) {
    return {
      name,
      status: "unhealthy",
      message: err instanceof Error ? err.message : "Connection failed",
    };
  }
};

const checkSupabaseService = async (
  name: string,
  checkFn: () => Promise<{ error: any }>,
  isHealthyFn: (error: any) => boolean,
  successMsg = "Service responding"
): Promise<ServiceStatus> => {
  try {
    const { error } = await checkFn();
    const isHealthy = isHealthyFn(error);
    return {
      name,
      status: isHealthy ? "healthy" : "unhealthy",
      message: isHealthy ? successMsg : error?.message || "Error",
    };
  } catch (err) {
    return {
      name,
      status: "unhealthy",
      message: err instanceof Error ? err.message : "Connection failed",
    };
  }
};

async function getSupabaseStatus() {
  const supabase = await createServerComponentClient();

  const services = await Promise.all([
    checkSupabaseService(
      "Auth (GoTrue)",
      () => supabase.auth.getUser(),
      (error) =>
        !error ||
        error.message?.includes("Auth session missing") ||
        error.message?.includes("Invalid JWT") ||
        error.message?.includes("JWT expired")
    ),
    checkHttpService("/rest/v1/", "REST API (PostgREST)", [200, 401]),
    checkSupabaseService(
      "Database (PostgreSQL)",
      () => supabase.storage.listBuckets(),
      (error) => !error,
      "Connected (verified via storage)"
    ),
    checkSupabaseService(
      "Storage",
      () => supabase.storage.listBuckets(),
      (error) => !error
    ),
    checkHttpService("/realtime/v1/", "Realtime", [200, 404]),
    checkHttpService("/rest/v1/", "API Gateway (Kong)", [200, 401]),
  ]);

  const healthyCount = services.filter((s) => s.status === "healthy").length;
  return {
    overall: healthyCount === services.length ? "healthy" : "degraded",
    healthyCount,
    totalCount: services.length,
    services,
  };
}

export default async function Home() {
  const supabase = await createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const status = await getSupabaseStatus();

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
              <form action={signOut}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-stripe-dark bg-white border border-stripe-border rounded-md hover:bg-stripe-bg focus:outline-none focus:ring-2 focus:ring-stripe-purple focus:ring-offset-2 transition-colors"
                >
                  Sign out
                </button>
              </form>
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
                status.overall === "healthy"
                  ? "text-stripe-green bg-stripe-green-bg"
                  : status.overall === "degraded"
                  ? "text-stripe-yellow bg-stripe-yellow-bg"
                  : "text-stripe-red bg-stripe-red-bg"
              }`}
            >
              {status.healthyCount}/{status.totalCount}
            </span>
          </div>

          <div className="space-y-3">
            {status.services.map((service: any) => (
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
                    href={
                      process.env.SUPABASE_PUBLIC_URL || "http://localhost:8000"
                    }
                    target="_blank"
                    className="text-stripe-purple"
                  >
                    {process.env.SUPABASE_PUBLIC_URL || "http://localhost:8000"}
                  </a>
                </div>
                <div className="mb-1">
                  <strong>Username:</strong>{" "}
                  <code>{process.env.DASHBOARD_USERNAME || "supabase"}</code>
                </div>
                <div>
                  <strong>Password:</strong>{" "}
                  <code>
                    {process.env.DASHBOARD_PASSWORD ||
                      "this_password_is_insecure_and_should_be_updated"}
                  </code>
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
                    <Link href={ROUTES.DASHBOARD} className="text-stripe-purple">
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
        </div>
      </div>
    </main>
  );
}
