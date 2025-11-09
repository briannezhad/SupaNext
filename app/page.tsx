import { createServerComponentClient } from "@/lib/supabase/server";

interface ServiceStatus {
  name: string;
  status: "healthy" | "unhealthy" | "unknown";
  message?: string;
}

async function getSupabaseStatus(): Promise<{
  overall: string;
  healthyCount: number;
  totalCount: number;
  services: ServiceStatus[];
  error?: string;
}> {
  const services: ServiceStatus[] = [];
  const supabase = await createServerComponentClient();

  // Check Auth Service
  try {
    const { error } = await supabase.auth.getUser();
    const isHealthy =
      !error ||
      error.message.includes("Auth session missing") ||
      error.message.includes("Invalid JWT") ||
      error.message.includes("JWT expired");
    services.push({
      name: "Auth (GoTrue)",
      status: isHealthy ? "healthy" : "unhealthy",
      message: isHealthy ? "Service responding" : error?.message,
    });
  } catch (err) {
    services.push({
      name: "Auth (GoTrue)",
      status: "unhealthy",
      message: err instanceof Error ? err.message : "Connection failed",
    });
  }

  // Check REST API (PostgREST)
  try {
    // Check if REST API endpoint responds (401 means it's working, just needs auth)
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:8000";
    const internalUrl = supabaseUrl
      .replace("localhost:8000", "kong:8000")
      .replace("127.0.0.1:8000", "kong:8000");
    const response = await fetch(`${internalUrl}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
    });
    // 401 or 200 means the service is responding
    services.push({
      name: "REST API (PostgREST)",
      status: response.ok || response.status === 401 ? "healthy" : "unhealthy",
      message:
        response.ok || response.status === 401
          ? "Service responding"
          : `HTTP ${response.status}`,
    });
  } catch (err) {
    services.push({
      name: "REST API (PostgREST)",
      status: "unhealthy",
      message: err instanceof Error ? err.message : "Connection failed",
    });
  }

  // Check Database Connection
  // We check this indirectly via Storage, which requires database connectivity
  // If Storage works, the database is connected
  try {
    const { error: storageError } = await supabase.storage.listBuckets();
    services.push({
      name: "Database (PostgreSQL)",
      status: storageError ? "unhealthy" : "healthy",
      message: storageError
        ? storageError.message
        : "Connected (verified via storage)",
    });
  } catch (err) {
    services.push({
      name: "Database (PostgreSQL)",
      status: "unhealthy",
      message: err instanceof Error ? err.message : "Connection failed",
    });
  }

  // Check Storage
  try {
    const { data, error } = await supabase.storage.listBuckets();
    services.push({
      name: "Storage",
      status: error ? "unhealthy" : "healthy",
      message: error ? error.message : "Service responding",
    });
  } catch (err) {
    services.push({
      name: "Storage",
      status: "unhealthy",
      message: err instanceof Error ? err.message : "Connection failed",
    });
  }

  // Check Realtime (via REST API check)
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:8000";
    const internalUrl = supabaseUrl
      .replace("localhost:8000", "kong:8000")
      .replace("127.0.0.1:8000", "kong:8000");
    const response = await fetch(`${internalUrl}/realtime/v1/`, {
      method: "GET",
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
    });
    services.push({
      name: "Realtime",
      status: response.ok || response.status === 404 ? "healthy" : "unhealthy",
      message:
        response.ok || response.status === 404
          ? "Service responding"
          : `HTTP ${response.status}`,
    });
  } catch (err) {
    services.push({
      name: "Realtime",
      status: "unhealthy",
      message: err instanceof Error ? err.message : "Connection failed",
    });
  }

  // Check Kong API Gateway
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:8000";
    const internalUrl = supabaseUrl
      .replace("localhost:8000", "kong:8000")
      .replace("127.0.0.1:8000", "kong:8000");
    const response = await fetch(`${internalUrl}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
    });
    services.push({
      name: "API Gateway (Kong)",
      status: response.ok || response.status === 401 ? "healthy" : "unhealthy",
      message:
        response.ok || response.status === 401
          ? "Service responding"
          : `HTTP ${response.status}`,
    });
  } catch (err) {
    services.push({
      name: "API Gateway (Kong)",
      status: "unhealthy",
      message: err instanceof Error ? err.message : "Connection failed",
    });
  }

  const allHealthy = services.every((s) => s.status === "healthy");
  const healthyCount = services.filter((s) => s.status === "healthy").length;

  return {
    overall: allHealthy ? "healthy" : "degraded",
    healthyCount,
    totalCount: services.length,
    services,
  };
}

export default async function Home() {
  const status = await getSupabaseStatus();

  return (
    <main className="py-12 px-6 max-w-6xl mx-auto bg-white">
      <div className="mb-12">
        <h1 className="text-2xl font-semibold mb-2 text-stripe-dark tracking-tight">
          SupaNext
        </h1>
        <p className="text-sm text-stripe-gray leading-normal">
          Next.js + Supabase Docker boilerplate
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Services Status */}
        <div className="p-5 bg-white border border-stripe-border rounded-md">
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

          {status.error ? (
            <div>
              <p className="text-[13px] text-stripe-red mb-2">{status.error}</p>
              <p className="text-[13px] text-stripe-gray">
                Make sure Supabase services are running. Check with:{" "}
                <code>docker compose ps</code>
              </p>
            </div>
          ) : (
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
          )}
        </div>

        {/* Right Column - Supabase Studio & Next Steps */}
        <div className="flex flex-col gap-6">
          <div className="p-5 bg-white border border-stripe-border rounded-md">
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

          <div className="p-5 bg-white border border-stripe-border rounded-md">
            <h2 className="text-sm font-semibold text-stripe-dark mb-4">
              Next steps
            </h2>
            <ol className="pl-5 text-[13px] text-stripe-dark leading-relaxed">
              <li className="mb-2">
                Log in to Supabase Studio using the credentials above
              </li>
              <li className="mb-2">Create your database tables</li>
              <li>Start building your app</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
