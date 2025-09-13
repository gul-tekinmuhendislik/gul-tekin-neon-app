import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Test için basit bir tweet gönder
    const testTweet = await inngest.send({
      name: "twitter/thread.create.requested",
      data: {
        tweets: [
          {
            text: "🚀 Test Tweet: Yeni Twitter entegrasyonumuz başarıyla çalışıyor! #NextJS #Inngest #TwitterAPI"
          }
        ]
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Test tweet kuyruğa alındı',
      eventId: testTweet.ids[0]
    });
  } catch (error) {
    console.error('Twitter test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { blogId, customText } = body;

    if (!blogId) {
      // Eğer blogId yoksa, mevcut bir blog bul
      const recentBlog = await sql`
        SELECT id, title
        FROM generated_content
        WHERE status = 'published'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (recentBlog.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Paylaşılacak blog bulunamadı'
          },
          { status: 404 }
        );
      }

      const shareEvent = await inngest.send({
        name: "blog/twitter.share.requested",
        data: {
          blogId: recentBlog[0].id,
          customText: customText || `Yeni blog yazımız yayında: ${recentBlog[0].title}`
        }
      });

      return NextResponse.json({
        success: true,
        message: `Blog "${recentBlog[0].title}" Twitter'da paylaşım kuyruğuna alındı`,
        blogId: recentBlog[0].id,
        eventId: shareEvent.ids[0]
      });
    }

    // Belirtilen blog ID ile paylaş
    const shareEvent = await inngest.send({
      name: "blog/twitter.share.requested",
      data: {
        blogId,
        customText
      }
    });

    return NextResponse.json({
      success: true,
      message: `Blog ID ${blogId} Twitter'da paylaşım kuyruğuna alındı`,
      eventId: shareEvent.ids[0]
    });
  } catch (error) {
    console.error('Twitter share error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}