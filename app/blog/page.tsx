"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BlogPost {
  id: number;
  topic: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  keywords: string[];
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Blog
        </h1>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-slate-800/50 rounded-lg p-6 animate-pulse"
              >
                <div className="h-6 bg-slate-700 rounded mb-4"></div>
                <div className="h-4 bg-slate-700 rounded mb-2"></div>
                <div className="h-4 bg-slate-700 rounded mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-400">
            Henüz blog yazısı bulunmuyor.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <article className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 h-full flex flex-col">
                  <h2 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-300 mb-4 flex-grow">
                    {getExcerpt(post.content)}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.keywords?.slice(0, 3).map((keyword, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>{formatDate(post.created_at)}</span>
                    <span className="group-hover:text-blue-400">
                      Devamını Oku →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}