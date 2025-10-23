import { NextResponse } from "next/server";

// [DISABLED] Test the 15-minute cron job manually
// Reason: Vertex AI access no longer available
// Date: 2025-10-23
// Previous: Triggered vertex-ai/15min.manual event

export async function GET() {
  return NextResponse.json({
    success: false,
    error: "Vertex AI 15-minute generation has been disabled",
    message: "Vertex AI access is no longer available. This endpoint is deprecated.",
    deprecatedDate: "2025-10-23"
  }, { status: 410 }); // 410 Gone - resource no longer available
}