import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Test saving mock data to database
    const mockSearchData = {
      query: "test search query",
      results: [
        {
          title: "Test Article 1",
          url: "https://example.com/article1",
          text: "This is a test article about AI developments",
          score: 0.95
        },
        {
          title: "Test Article 2", 
          url: "https://example.com/article2",
          text: "Another test article about machine learning",
          score: 0.87
        }
      ]
    };

    let savedCount = 0;
    for (const result of mockSearchData.results) {
      await sql`
        INSERT INTO search_results (
          search_query,
          search_type,
          result_title,
          result_url,
          result_content,
          result_score,
          metadata
        ) VALUES (
          ${mockSearchData.query},
          'test',
          ${result.title},
          ${result.url},
          ${result.text},
          ${result.score},
          ${JSON.stringify({ test: true })}
        )
      `;
      savedCount++;
    }

    // Log to event_logs
    await sql`
      INSERT INTO event_logs (
        event_name,
        event_type,
        status,
        payload
      ) VALUES (
        'test.exa.search',
        'test',
        'completed',
        ${JSON.stringify({ savedCount })}
      )
    `;

    return NextResponse.json({
      success: true,
      message: "Test data saved successfully",
      savedCount: savedCount
    });
  } catch (error) {
    console.error("Error in test:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}