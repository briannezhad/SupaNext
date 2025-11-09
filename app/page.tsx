import { createServerComponentClient } from "@/lib/supabase/server";
import { Welcome } from "@/app/components/Welcome";

interface ServiceStatus {
  name: string;
  status: "healthy" | "unhealthy";
  message?: string;
}

/**
 * Gets the internal Supabase URL for server-side requests.
 * Replaces localhost with Docker service name when running in Docker.
 */
function getInternalUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:8000";
  return url
    .replace("localhost:8000", "kong:8000")
    .replace("127.0.0.1:8000", "kong:8000");
}

/**
 * Checks if an HTTP service is responding.
 */
async function checkHttpService(
  path: string,
  name: string,
  successCodes: number[] = [200, 401, 404]
): Promise<ServiceStatus> {
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
}

/**
 * Checks if a Supabase service is responding.
 */
async function checkSupabaseService(
  name: string,
  checkFn: () => Promise<{ error: any }>,
  isHealthyFn: (error: any) => boolean,
  successMsg = "Service responding"
): Promise<ServiceStatus> {
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
}

/**
 * Checks the status of all Supabase services.
 * This demonstrates how to use the Supabase client in server components.
 */
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
  const status = await getSupabaseStatus();

  // Get credentials from environment variables (server-side only)
  const dashboardUsername = process.env.DASHBOARD_USERNAME || "supabase";
  const dashboardPassword =
    process.env.DASHBOARD_PASSWORD ||
    "this_password_is_insecure_and_should_be_updated";
  const supabaseUrl =
    process.env.SUPABASE_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "http://localhost:8000";

  return (
    <Welcome
      initialStatus={status}
      dashboardUsername={dashboardUsername}
      dashboardPassword={dashboardPassword}
      supabaseUrl={supabaseUrl}
    />
  );
}
