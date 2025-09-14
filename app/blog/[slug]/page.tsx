import { Metadata } from 'next';
import { sql } from '@/lib/db';
import BlogDetailClient from './page-client';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const posts = await sql`
      SELECT
        title,
        meta_title,
        meta_description,
        keywords,
        image_url
      FROM generated_content
      WHERE slug = ${slug} AND (status = 'completed' OR status = 'published')
    `;

    if (posts.length === 0) {
      return {
        title: 'Blog Yazısı Bulunamadı',
        description: 'Aradığınız blog yazısı bulunamadı.'
      };
    }

    const post = posts[0];

    // Prepare Open Graph images array
    const ogImages = post.image_url
      ? [{
          url: post.image_url,
          width: 1200,
          height: 630,
          alt: post.title,
        }]
      : [];

    return {
      title: post.meta_title || post.title,
      description: post.meta_description || `${post.title} hakkında detaylı bilgi`,
      keywords: post.keywords?.join(', '),
      alternates: {
        canonical: `https://ai.gul-tekinmuhendislik.com/blog/${slug}`,
      },
      openGraph: {
        title: post.meta_title || post.title,
        description: post.meta_description,
        type: 'article',
        url: `https://ai.gul-tekinmuhendislik.com/blog/${slug}`,
        images: ogImages,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.meta_title || post.title,
        description: post.meta_description,
        images: ogImages,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog',
      description: 'Gül-Tekin Mühendislik Blog'
    };
  }
}

export default function BlogDetailPage() {
  return <BlogDetailClient />;
}