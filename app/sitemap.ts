import { MetadataRoute } from "next";
import { siteConfig } from "./metadata";
import { sql } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const currentDate = new Date().toISOString();

  // Blog yazılarını veritabanından çek
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const posts = await sql`
      SELECT slug, updated_at 
      FROM generated_content 
      WHERE status IN ('completed', 'published')
      ORDER BY created_at DESC
    `;
    
    blogPosts = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ai`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...staticPages, ...blogPosts];
}