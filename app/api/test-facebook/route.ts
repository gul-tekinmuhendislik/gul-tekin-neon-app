import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { sql } from "@/lib/db";

export async function POST() {
  try {
    // Get the most recent content
    const recentContent = await sql`
      SELECT 
        id, 
        title, 
        slug,
        meta_description
      FROM generated_content
      WHERE status = 'published'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (recentContent.length === 0) {
      // If no content exists, create a test content
      const testContent = await sql`
        INSERT INTO generated_content (
          topic,
          title,
          content,
          slug,
          meta_title,
          meta_description,
          keywords,
          status,
          published_at
        ) VALUES (
          'Test İçerik',
          'Isı Pompası Sistemleri: 2024 Rehberi',
          '# Isı Pompası Sistemleri Test İçeriği\n\nBu bir test içeriğidir.',
          'test-isi-pompasi-' || ${Date.now()},
          'Isı Pompası Sistemleri: 2024 Rehberi - Gül-Tekin Mühendislik',
          'Bodrum ve Milas bölgesinde ısı pompası sistemleri kurulumu ve bakımı. 20+ yıl deneyim, 500+ başarılı proje.',
          ARRAY['ısı pompası', 'enerji verimliliği', 'bodrum', 'klima', 'ısıtma'],
          'published',
          NOW()
        )
        RETURNING id, title, slug
      `;
      
      const contentId = testContent[0].id;
      
      // Trigger Facebook post event
      await inngest.send({
        name: "social/facebook.post",
        data: {
          contentId: contentId,
          immediate: true
        }
      });

      return NextResponse.json({
        success: true,
        message: "Test content created and Facebook post triggered",
        contentId: contentId,
        title: testContent[0].title,
        slug: testContent[0].slug
      });
    }

    // Use existing content
    const contentId = recentContent[0].id;
    
    // Trigger Facebook post event
    await inngest.send({
      name: "social/facebook.post",
      data: {
        contentId: contentId,
        immediate: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Facebook post event triggered - using existing content",
      contentId: contentId,
      title: recentContent[0].title,
      slug: recentContent[0].slug
    });

  } catch (error) {
    console.error("Error triggering Facebook post:", error);
    return NextResponse.json(
      { 
        error: "Failed to trigger Facebook post", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check Facebook configuration
    const hasConfig = !!(process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN);
    
    // Get recent content
    const recentContent = await sql`
      SELECT 
        id,
        title,
        slug,
        created_at
      FROM generated_content
      WHERE status = 'published'
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    // Get recent Facebook posts
    const recentPosts = await sql`
      SELECT 
        sp.content_id,
        sp.post_id,
        sp.status,
        sp.posted_at,
        gc.title
      FROM social_media_posts sp
      JOIN generated_content gc ON gc.id = sp.content_id
      WHERE sp.platform = 'facebook'
      ORDER BY sp.created_at DESC
      LIMIT 5
    `;
    
    return NextResponse.json({
      configured: hasConfig,
      pageId: process.env.FACEBOOK_PAGE_ID ? "Configured" : "Not configured",
      accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN ? "Configured" : "Not configured",
      recentContent: recentContent,
      recentFacebookPosts: recentPosts,
      testEndpoint: "/api/test-facebook (POST to trigger)"
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get Facebook status", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}