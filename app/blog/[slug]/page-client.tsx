"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/app/components/Breadcrumb";
import BlogArticleSchema from "@/components/BlogArticleSchema";

interface BlogPost {
  id: number;
  topic: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  search_data: { url: string; title: string; content?: string }[];
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  image?: string;
  image_url?: string;
  image_prompt?: string;
}

export default function BlogDetailClient() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/blog/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          setPost(data);
        } else {
          router.push("/blog");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        router.push("/blog");
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      fetchPost();
    }
  }, [params.slug, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderContent = (content: string) => {
    // SEO başlığı ve meta açıklamayı içerikten kaldır
    const cleanContent = content
      .replace(/\*\*SEO Başlığı:\*\*.*/g, '')
      .replace(/\*\*Meta Açıklama:\*\*.*/g, '')
      .replace(/\*\*URL Slug:\*\*.*/g, '')
      .replace(/\*\*Anahtar Kelimeler:\*\*.*/g, '');
    
    // Basit markdown render işlemi
    let html = cleanContent;
    
    // Başlıklar
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>');
    
    // Bold text
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>');
    
    // Linkler
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Liste öğeleri
    html = html.replace(/^\* (.+)$/gim, '<li class="ml-6 mb-2">• $1</li>');
    html = html.replace(/^\d+\. (.+)$/gim, '<li class="ml-6 mb-2">$1</li>');
    
    // Paragraflar
    html = html.split('\n\n').map(paragraph => {
      if (paragraph.trim() === '') return '';
      if (paragraph.includes('<h1') || paragraph.includes('<h2') || paragraph.includes('<h3')) {
        return paragraph;
      }
      if (paragraph.includes('<li')) {
        return `<ul class="mb-6">${paragraph}</ul>`;
      }
      return `<p class="mb-4 leading-relaxed">${paragraph}</p>`;
    }).join('\n');
    
    return html;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Blog yazısı bulunamadı</h1>
          <Link href="/blog" className="text-blue-600 hover:underline">
            ← Blog sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogArticleSchema
        title={post.title}
        description={post.meta_description || post.title}
        datePublished={post.created_at}
        dateModified={post.updated_at}
        image={post.image_url || post.image}
        url={`https://ai.gul-tekinmuhendislik.com/blog/${post.slug}`}
        keywords={post.keywords}
      />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Breadcrumb 
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: post.title }
          ]}
        />

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {(post.image_url || post.image) && (
            <div className="relative h-64 md:h-96 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image_url || post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              {post.image_url && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-sm px-3 py-1 rounded-full font-medium shadow-lg">
                  AI Generated
                </div>
              )}
            </div>
          )}
          <div className="p-8">
            <header className="mb-8 pb-8 border-b border-gray-200">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                {post.title}
              </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>{formatDate(post.created_at)}</span>
              {post.updated_at !== post.created_at && (
                <span>Güncellendi: {formatDate(post.updated_at)}</span>
              )}
            </div>
            {post.meta_description && (
              <p className="mt-4 text-lg text-gray-600">
                {post.meta_description}
              </p>
            )}
            </header>

            <div 
              className="prose max-w-none prose-gray prose-lg"
              dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
            />

            {post.keywords && post.keywords.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Anahtar Kelimeler</h3>
                <div className="flex flex-wrap gap-2">
                  {post.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}