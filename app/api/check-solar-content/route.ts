import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Güneş Enerjisi ile ilgili içerikleri kontrol et
    const solarContent = await sql`
      SELECT 
        id, 
        topic, 
        title, 
        status, 
        created_at,
        metadata
      FROM generated_content 
      WHERE topic ILIKE '%güneş%' 
         OR topic ILIKE '%solar%'
         OR topic ILIKE '%fotovoltaik%'
         OR title ILIKE '%güneş%'
         OR title ILIKE '%solar%'
         OR title ILIKE '%fotovoltaik%'
      ORDER BY created_at DESC
    `;

    // Bugünkü içerikleri kontrol et
    const today = new Date().toISOString().split('T')[0];
    const todaysContent = await sql`
      SELECT 
        id, 
        topic, 
        title, 
        created_at
      FROM generated_content 
      WHERE DATE(created_at) = ${today}
      ORDER BY created_at DESC
    `;

    // Tüm konuları ve sayılarını getir
    const contentByTopic = await sql`
      SELECT 
        topic,
        COUNT(*) as count,
        MAX(created_at) as last_created
      FROM generated_content
      GROUP BY topic
      ORDER BY count DESC
    `;

    return NextResponse.json({
      solarContentCount: solarContent.length,
      solarContent: solarContent,
      todaysContentCount: todaysContent.length,
      todaysContent: todaysContent,
      contentByTopic: contentByTopic,
      message: solarContent.length === 0 
        ? "Güneş Enerjisi ile ilgili hiç içerik bulunamadı" 
        : `${solarContent.length} adet Güneş Enerjisi içeriği bulundu`
    });
  } catch (error) {
    console.error("Error checking solar content:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}