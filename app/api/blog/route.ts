import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
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
        status,
        published_at,
        created_at,
        updated_at
      FROM generated_content
      WHERE status = 'completed' OR status = 'published'
      ORDER BY created_at DESC
    `;

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}