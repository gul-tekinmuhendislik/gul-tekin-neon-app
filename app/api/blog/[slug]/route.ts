import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    // Önce slug ile dene
    let posts = await sql`
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
        search_data,
        status,
        published_at,
        created_at,
        updated_at
      FROM generated_content
      WHERE slug = ${slug} AND (status = 'completed' OR status = 'published')
    `;

    // Slug bulunamazsa, id olarak dene (geriye dönük uyumluluk için)
    if (posts.length === 0 && /^\d+$/.test(slug)) {
      posts = await sql`
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
          search_data,
          status,
          published_at,
          created_at,
          updated_at
        FROM generated_content
        WHERE id = ${slug} AND (status = 'completed' OR status = 'published')
      `;
    }

    if (posts.length === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(posts[0]);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}