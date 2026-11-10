import { Metadata } from "next";
import BlogDetailClient from "./page-client";
import { getBlogPostBySlug, type BlogPost } from "@/lib/static-data";

export async function generateStaticParams() {
  // Import here to avoid build-time issues if data file doesn't exist yet
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

export default function BlogDetailPage() {
  return <BlogDetailClient />;
}
