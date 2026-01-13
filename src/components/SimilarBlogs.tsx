"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Eye, Calendar, Send } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { az } from "date-fns/locale";

interface SimilarBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  reading_time_minutes: number | null;
  views: number | null;
  published_at: string | null;
  blog_authors: {
    name: string;
    avatar_url: string | null;
  } | null;
}

interface SimilarBlogsProps {
  currentBlogId: string;
  isMobile?: boolean;
}

const SimilarBlogs = ({ currentBlogId, isMobile = false }: SimilarBlogsProps) => {
  const [similarBlogs, setSimilarBlogs] = useState<SimilarBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimilarBlogs();
  }, [currentBlogId]);

  const fetchSimilarBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select(`
          id, title, slug, excerpt, featured_image, reading_time_minutes, views, published_at,
          blog_authors (name, avatar_url)
        `)
        .eq("is_active", true)
        .eq("is_published", true)
        .neq("id", currentBlogId)
        .order("published_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setSimilarBlogs((data as SimilarBlog[]) || []);
    } catch (error) {
      console.error("Error fetching similar blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate JSON-LD structured data for SEO
  const generateJsonLd = () => {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Oxşar Məqalələr",
      "description": "Karyera inkişafı və iş axtarışı haqqında digər məqalələr",
      "numberOfItems": similarBlogs.length,
      "itemListElement": similarBlogs.map((blog, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Article",
          "headline": blog.title,
          "description": blog.excerpt,
          "url": `https://Jobin.az/blog/${blog.slug}`,
          ...(blog.featured_image && { "image": blog.featured_image }),
          ...(blog.published_at && {
            "datePublished": new Date(blog.published_at).toISOString().split('T')[0]
          }),
          ...(blog.blog_authors && {
            "author": {
              "@type": "Person",
              "name": blog.blog_authors.name
            }
          })
        }
      }))
    };
  };

  if (loading || similarBlogs.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 mb-6">
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd()) }}
      />
      
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
          <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-foreground`}>
            Oxşar Məqalələr
          </h2>
        </div>
      </div>

      {/* Blogs Grid */}
      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-3`}>
        {similarBlogs.map((blog, index) => (
          <Link
            key={blog.id}
            href={`/blog/${blog.slug}`}
            className="group relative overflow-hidden rounded-xl border bg-card border-border/50 hover:bg-accent/30 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Card Content */}
            <div className="flex gap-3">
              {/* Featured Image */}
              {blog.featured_image && (
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-border group-hover:border-primary/40 transition-all duration-300">
                    <img
                      src={blog.featured_image}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Blog Info */}
              <div className="flex-1 min-w-0">
                {/* Blog Title */}
                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {blog.title}
                </h3>

                {/* Author Name */}
                {blog.blog_authors && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {blog.blog_authors.name}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{blog.reading_time_minutes || 1} dəq</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span>{blog.views || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer: Date */}
            <div className="flex items-center justify-end mt-3 pt-3 border-t border-border/50">
              {blog.published_at && (
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(blog.published_at), "d MMM yyyy", { locale: az })}
                </span>
              )}
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </Link>
        ))}
      </div>

      {/* Telegram Channel Promotion */}
      <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-[#0088cc]/10 to-[#0088cc]/5 dark:from-[#0088cc]/20 dark:to-[#0088cc]/10 border border-[#0088cc]/20">
        <div className="flex items-center justify-center gap-3 flex-wrap text-center">
          <Send className="w-5 h-5 text-[#0088cc]" />
          <p className="text-sm text-foreground">
            Daha çox məqalə üçün{" "}
            <a
              href="https://t.me/Jobinaz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#0088cc] hover:text-[#006699] hover:underline transition-colors"
            >
              Telegram kanalımıza
            </a>
            {" "}qoşulun.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SimilarBlogs;
