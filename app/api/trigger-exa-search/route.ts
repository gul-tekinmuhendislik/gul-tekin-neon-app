import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Trigger the search function manually
    const result = await inngest.send({
      name: "search-and-save-results/scheduled",
      data: {}
    });

    return NextResponse.json({ 
      success: true,
      message: "Exa search function triggered successfully",
      eventId: result.ids?.[0],
      note: "Check http://localhost:8288 to monitor the function execution"
    });
  } catch (error) {
    console.error("Error triggering Exa search:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to trigger search function",
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Exa Search Trigger Endpoint",
    info: "Send a POST request to trigger the Exa search function manually",
    cron: "The function also runs automatically every 6 hours"
  });
}