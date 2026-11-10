"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatedCard } from "@/components/ui/animated-card";
import { getAllBlogPosts, type BlogPost } from "@/lib/static-data";

interface PaginationInfo {
  page: number;
  limit: number;
  totalPosts: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function BlogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const limit = 9;

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const allPosts = getAllBlogPosts();
      const totalPosts = allPosts.length;
      const totalPages = Math.ceil(totalPosts / limit);
      const page = Math.max(1, Math.min(currentPage, totalPages || 1));
      const start = (page - 1) * limit;
      const pagePosts = allPosts.slice(start, start + limit);

      setPosts(pagePosts);
      setPagination({
        page,
        limit,
        totalPosts,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      });
    } catch (error) {
      console.error("Error loading posts:", error);
      setPosts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getExcerpt = (content: string, length: number = 200) => {
    const plainText = content
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/\n/g, " ")
      .trim();
    return plainText.length > length
      ? plainText.substring(0, length) + "..."
      : plainText;
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Blog
        </h1>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <AnimatedCard
                key={i}
                className="animate-pulse"
              >
                <div className="p-6">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-600">
            Henüz blog yazısı bulunmuyor.
          </p>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <AnimatedCard
                  key={post.id}
                  withArrow={true}
                  gradientColors={["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"]}
                  className="h-full"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block h-full"
                  >
                    <article className="flex flex-col h-full">
                      {(post.image_url || post.image) && (
                        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                          <picture>
                            <source
                              srcSet={`/images/blog/${post.id}.webp`}
                              type="image/webp"
                            />
                            <img
                              src={post.image_url || post.image}
                              alt={post.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                              decoding="async"
                            />
                          </picture>
                          {post.image_url && (
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                              AI Generated
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col">
                        <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                          {post.title}
                        </h2>
                        <p className="text-gray-600 mb-4 flex-grow leading-relaxed">
                          {getExcerpt(post.content)}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.seo_keywords?.slice(0, 3)?.map?.((keyword, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1 rounded-full font-medium"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">{formatDate(post.created_at || post.published_at || post.updated_at || '')}</span>
                          <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-semibold">
                            Devamını Oku →
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </AnimatedCard>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md'
                  }`}
                  aria-label="İlk sayfa"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                    !pagination.hasPrev
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md'
                  }`}
                  aria-label="Önceki sayfa"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex space-x-1">
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                    const endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);

                    let adjustedStart = startPage;
                    if (endPage - adjustedStart < maxVisible - 1) {
                      adjustedStart = Math.max(1, endPage - maxVisible + 1);
                    }
                    startPage = adjustedStart;

                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => handlePageChange(1)}
                          className="px-3 py-2 rounded-lg font-medium bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md transition-all"
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span key="dots1" className="px-2 py-2 text-gray-400">...</span>
                        );
                      }
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`px-3 py-2 rounded-lg font-medium transition-all ${
                            i === currentPage
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                              : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }

                    if (endPage < pagination.totalPages) {
                      if (endPage < pagination.totalPages - 1) {
                        pages.push(
                          <span key="dots2" className="px-2 py-2 text-gray-400">...</span>
                        );
                      }
                      pages.push(
                        <button
                          key={pagination.totalPages}
                          onClick={() => handlePageChange(pagination.totalPages)}
                          className="px-3 py-2 rounded-lg font-medium bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md transition-all"
                        >
                          {pagination.totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                    !pagination.hasNext
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md'
                  }`}
                  aria-label="Sonraki sayfa"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={currentPage === pagination.totalPages}
                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                    currentPage === pagination.totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md'
                  }`}
                  aria-label="Son sayfa"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {pagination && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Toplam {pagination.totalPosts} yazı • Sayfa {pagination.page} / {pagination.totalPages}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Blog
            </h1>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <AnimatedCard
                  key={i}
                  className="animate-pulse"
                >
                  <div className="p-6">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <BlogContent />
    </Suspense>
  );
}
