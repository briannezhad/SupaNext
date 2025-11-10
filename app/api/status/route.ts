import { NextResponse } from "next/server";

/**
 * Dummy data endpoint
 * Returns sample data for demonstration purposes
 */
export async function GET() {
  // Simulate some delay (optional, for realistic API behavior)
  await new Promise((resolve) => setTimeout(resolve, 100));

  return NextResponse.json({
    success: true,
    message: "API is working",
    timestamp: new Date().toISOString(),
  });
}
