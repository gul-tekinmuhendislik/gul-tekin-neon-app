import { Metadata } from "next";
import BlogDetailClient from "./page-client";
import { getBlogPostBySlug, getAllUrunler, type BlogPost } from "@/lib/static-data";
import { findRelatedProducts } from "@/lib/blog-related-products";

export async function generateStaticParams() {
  const { getAllBlogPostSlugs } = await import("@/lib/static-data");
  const slugs = getAllBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = getBlogPostBySlug(slug) as BlogPost | null;

    if (!post) {
      return {
        title: "Blog Yazısı Bulunamadı",
        description: "Aradığınız blog yazısı bulunamadı.",
      };
    }

    const ogImages = post.image_url
      ? [
          {
            url: post.image_url,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ]
      : [];

    return {
      title: post.seo_title || post.meta_title || post.title,
      description:
        post.seo_description ||
        post.meta_description ||
        `${post.title} hakkında detaylı bilgi`,
      keywords: post.seo_keywords?.join(", "),
      alternates: {
        canonical: `https://gul-tekinmuhendislik.com/blog/${slug}`,
        languages: {
          "tr-TR": `https://gul-tekinmuhendislik.com/blog/${slug}`,
          "x-default": `https://gul-tekinmuhendislik.com/blog/${slug}`,
        },
      },
      openGraph: {
        title: post.seo_title || post.meta_title || post.title,
        description:
          post.seo_description || post.meta_description,
        type: "article",
        url: `https://gul-tekinmuhendislik.com/blog/${slug}`,
        images: ogImages,
      },
      twitter: {
        card: "summary_large_image",
        title: post.seo_title || post.meta_title || post.title,
        description:
          post.seo_description || post.meta_description,
        images: ogImages,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Blog",
      description: "Gül-Tekin Mühendislik Blog",
    };
  }
}

interface BlogDetailPageProps {
  post: BlogPost;
  relatedProducts: Array<{
    id: string | number;
    urun_adi: string;
    slug: string;
    marka?: string;
    kategori?: string;
    cloudinary_url?: string;
    gorsel_url?: string;
    matchScore: number;
  }>;
}

export default async function BlogDetailPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug) as BlogPost | null;

  if (!post) {
    return <BlogDetailClient post={null as any} relatedProducts={[]} />;
  }

  const allUrunler = getAllUrunler();
  const relatedProducts = findRelatedProducts(post.content, allUrunler as any);

  return (
    <BlogDetailClient post={post} relatedProducts={relatedProducts} />
  );
}
