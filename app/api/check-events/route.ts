import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const events = await sql`
      SELECT 
        id,
        event_name,
        event_type,
        status,
        payload,
        metadata,
        created_at
      FROM event_logs
      WHERE event_name LIKE '%image%' OR event_name LIKE '%fal%'
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({
      success: true,
      count: events.length,
      events: events
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch events",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}