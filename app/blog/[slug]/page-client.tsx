"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/app/components/Breadcrumb";
import BlogArticleSchema from "@/components/BlogArticleSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { extractLocationsFromContent, extractBrandsFromContent, addInternalLinksToContent } from "@/lib/seo-utils";

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
    let cleanContent = content
      .replace(/\*\*SEO Başlığı:\*\*.*/g, '')
      .replace(/\*\*Meta Açıklama:\*\*.*/g, '')
      .replace(/\*\*URL Slug:\*\*.*/g, '')
      .replace(/\*\*Anahtar Kelimeler:\*\*.*/g, '');

    // Add internal links to locations and brands (BEFORE markdown rendering)
    cleanContent = addInternalLinksToContent(cleanContent);

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
      <BreadcrumbSchema
        items={[
          { name: 'Ana Sayfa', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: post.title, url: `/blog/${post.slug}` }
        ]}
      />
      <BlogArticleSchema
        title={post.title}
        description={post.meta_description || post.title}
        datePublished={post.created_at}
        dateModified={post.updated_at}
        image={post.image_url || post.image}
        url={`https://gul-tekinmuhendislik.com/blog/${post.slug}`}
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

            {/* İlgili Lokasyonlar */}
            {(() => {
              const locations = extractLocationsFromContent(post.content);
              return locations.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    İlgili Lokasyonlar
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {locations.map((location) => (
                      <Link
                        key={location.slug}
                        href={`/lokasyonlar/${location.slug}`}
                        className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
                      >
                        <svg className="w-4 h-4 mr-2 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">{location.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* İlgili Markalar */}
            {(() => {
              const brands = extractBrandsFromContent(post.content);
              return brands.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    İlgili Markalar
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {brands.map((brand) => (
                      <Link
                        key={brand.slug}
                        href={`/markalar/${brand.slug}`}
                        className="flex items-center justify-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
                      >
                        <span className="text-sm font-semibold text-gray-900 group-hover:scale-105 transition-transform">{brand.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </article>
      </div>
    </div>
  );
}