import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const offset = (page - 1) * limit;

    // Toplam post sayısını al
    const [countResult] = await sql`
      SELECT COUNT(*) as total
      FROM generated_content
      WHERE status = 'completed' OR status = 'published'
    `;
    const totalPosts = parseInt(countResult.total);
    const totalPages = Math.ceil(totalPosts / limit);

    // Sayfadaki postları al
    const posts = await sql`
      SELECT
        id,
        topic,
        title,
        slug,
        content,
        meta_title,
        meta_description,
        keywords,
        image_url,
        image_prompt,
        status,
        published_at,
        created_at,
        updated_at
      FROM generated_content
      WHERE status = 'completed' OR status = 'published'
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}