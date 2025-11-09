import { createServerClient } from "@/lib/supabase/server";

async function checkSupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Check if environment variables are set
  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl === "http://localhost:8000" ||
    supabaseKey === "your-service-role-key"
  ) {
    return {
      connected: false,
      error:
        "Supabase credentials not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.",
      url: supabaseUrl || "Not set",
    };
  }

  try {
    const supabase = createServerClient();

    // Test connection by making a simple API call to Supabase
    // Using from() with a non-existent table will return an error, but that means we're connected
    // If we get a network error, the connection failed
    const { error } = await supabase
      .from("_connection_test_")
      .select("*")
      .limit(1);

    // If error is about table not found or permission, we're connected (just no table)
    // If error is about network/connection, we're not connected
    if (error) {
      // Check if it's a connection/network error
      if (
        error.message.includes("fetch") ||
        error.message.includes("network") ||
        error.message.includes("Failed to fetch")
      ) {
        return {
          connected: false,
          error: `Cannot reach Supabase at ${supabaseUrl}. Please check your NEXT_PUBLIC_SUPABASE_URL.`,
          url: supabaseUrl,
        };
      }

      // Check if it's an authentication error
      if (
        error.message.includes("JWT") ||
        error.message.includes("Invalid API key") ||
        error.code === "PGRST301"
      ) {
        return {
          connected: false,
          error:
            "Supabase connection failed: Invalid API key. Please check your SUPABASE_SERVICE_ROLE_KEY.",
          url: supabaseUrl,
        };
      }

      // Other errors (like table not found) mean we're connected!
      // This is actually a good sign - it means Supabase responded
      return {
        connected: true,
        error: null,
        url: supabaseUrl,
      };
    }

    // If no error, we're connected
    return {
      connected: true,
      error: null,
      url: supabaseUrl,
    };
  } catch (error) {
    // Network or other errors
    return {
      connected: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error connecting to Supabase",
      url: supabaseUrl,
    };
  }
}

export default async function Home() {
  const connectionStatus = await checkSupabaseConnection();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          width: "100%",
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "4rem",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 700,
              color: "#000000",
              marginBottom: "1.5rem",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            SupaNext
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "#666666",
              marginBottom: "2rem",
              fontWeight: 400,
              lineHeight: 1.6,
              maxWidth: "600px",
              margin: "0 auto 2rem",
            }}
          >
            A lightweight, production-ready boilerplate for Next.js and Supabase
          </p>
        </div>

        {/* Connection Status Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "8px",
            padding: "2rem",
            marginBottom: "2rem",
            border: "1px solid #e5e5e5",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: connectionStatus.connected ? "#000000" : "#666666",
                border: "1px solid #000000",
              }}
            />
            <h2
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#000000",
                margin: 0,
              }}
            >
              Supabase Connection
            </h2>
          </div>

          {connectionStatus.connected ? (
            <div>
              <p
                style={{
                  color: "#000000",
                  fontWeight: 500,
                  marginBottom: "0.75rem",
                  fontSize: "0.9375rem",
                }}
              >
                ✓ Successfully connected
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#666666",
                  marginTop: "0.5rem",
                  fontFamily: "monospace",
                }}
              >
                {connectionStatus.url}
              </p>
            </div>
          ) : (
            <div>
              <p
                style={{
                  color: "#000000",
                  fontWeight: 500,
                  marginBottom: "0.75rem",
                  fontSize: "0.9375rem",
                }}
              >
                Connection failed
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#666666",
                  marginTop: "0.5rem",
                  lineHeight: 1.6,
                }}
              >
                {connectionStatus.error}
              </p>
              {connectionStatus.url && connectionStatus.url !== "Not set" && (
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#666666",
                    marginTop: "0.75rem",
                    fontFamily: "monospace",
                  }}
                >
                  {connectionStatus.url}
                </p>
              )}
            </div>
          )}
        </div>

        {/* API Endpoint Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "8px",
            padding: "1.5rem",
            border: "1px solid #e5e5e5",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h3
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#000000",
              marginBottom: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Available Endpoints
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem",
              background: "#f5f5f5",
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "0.875rem",
              border: "1px solid #e5e5e5",
            }}
          >
            <span style={{ color: "#000000" }}>GET</span>
            <span style={{ color: "#000000" }}>/api/health</span>
            <span style={{ color: "#666666", marginLeft: "auto" }}>
              Health check
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
