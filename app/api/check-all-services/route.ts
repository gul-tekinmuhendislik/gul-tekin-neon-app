import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const services = await sql`
      SELECT id, hizmet_adi, slug
      FROM hizmetler
      ORDER BY hizmet_adi
    `;

    return NextResponse.json({
      success: true,
      count: services.length,
      services: services.map(s => s.hizmet_adi)
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}