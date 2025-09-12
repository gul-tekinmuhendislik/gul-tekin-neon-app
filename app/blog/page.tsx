"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatedCard } from "@/components/ui/animated-card";

interface BlogPost {
  id: number;
  topic: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  keywords: string[];
  image?: string;
  image_url?: string;
  image_prompt?: string;
  created_at: string;
  updated_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/blog");
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Blog
        </h1>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.image_url || post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
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
                        {post.keywords?.slice(0, 3).map((keyword, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1 rounded-full font-medium"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{formatDate(post.created_at)}</span>
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
        )}
      </div>
    </div>
  );
}