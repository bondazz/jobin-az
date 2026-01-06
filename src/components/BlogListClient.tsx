"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import { 
  Clock, 
  Eye, 
  Calendar, 
  User, 
  Tag, 
  Search,
  ChevronRight,
  BookOpen,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import SEOBreadcrumb from "@/components/SEOBreadcrumb";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  reading_time_minutes: number | null;
  views: number | null;
  blog_authors: {
    id: string;
    name: string;
    slug: string;
    avatar_url: string | null;
  } | null;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogListClientProps {
  blogs: Blog[];
  categories: BlogCategory[];
}

export default function BlogListClient({ blogs, categories }: BlogListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [blogs, searchQuery]);

  const popularBlogs = useMemo(() => {
    return [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  }, [blogs]);

  const recentBlogs = useMemo(() => {
    return blogs.slice(0, 5);
  }, [blogs]);

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-screen">
        <div className="container mx-auto px-4 py-6 pb-24 lg:pb-6">
          {/* Breadcrumb - SEO */}
          <SEOBreadcrumb
            items={[{ label: "Bloq" }]}
            className="mb-4"
          />

          {/* Header */}
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Bloq
            </h1>
            <p className="text-muted-foreground">
              Karyera inkişafı, iş axtarışı və əmək bazarı haqqında ən son məqalələr
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Categories (Desktop) */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-4 space-y-4">
                {/* Categories */}
                <Card>
                  <CardHeader className="pb-3">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" />
                      Kateqoriyalar
                    </h2>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <nav className="space-y-1">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          !selectedCategory
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        Hamısı
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedCategory === category.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Popular Posts */}
                <Card>
                  <CardHeader className="pb-3">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Populyar Məqalələr
                    </h2>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <nav className="space-y-3">
                      {popularBlogs.map((blog, index) => (
                        <Link
                          key={blog.id}
                          href={`/blog/${blog.slug}`}
                          className="block group"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg font-bold text-muted-foreground/50 group-hover:text-primary transition-colors">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                {blog.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Eye className="w-3 h-3" />
                              <span>{blog.views || 0}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* Main Content - Blog List */}
            <main className="lg:col-span-6">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Məqalə axtar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Blog Grid */}
              <div className="space-y-6">
                {filteredBlogs.length === 0 ? (
                  <Card className="p-8 text-center">
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Məqalə tapılmadı</h3>
                    <p className="text-muted-foreground">
                      Axtarış kriteriyalarınıza uyğun məqalə yoxdur.
                    </p>
                  </Card>
                ) : (
                  filteredBlogs.map((blog) => (
                    <article key={blog.id}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                        <Link href={`/blog/${blog.slug}`}>
                          {blog.featured_image && (
                            <div className="aspect-video overflow-hidden">
                              <img
                                src={blog.featured_image}
                                alt={blog.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <CardContent className="p-4">
                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                              {blog.published_at && (
                                <time dateTime={blog.published_at} className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(blog.published_at), "d MMM yyyy", { locale: az })}
                                </time>
                              )}
                              {blog.reading_time_minutes && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {blog.reading_time_minutes} dəq oxuma
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {blog.views || 0}
                              </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                              {blog.title}
                            </h2>

                            {/* Excerpt */}
                            {blog.excerpt && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {blog.excerpt}
                              </p>
                            )}

                            {/* Author */}
                            {blog.blog_authors && (
                              <div className="flex items-center gap-2">
                                {blog.blog_authors.avatar_url ? (
                                  <img
                                    src={blog.blog_authors.avatar_url}
                                    alt={blog.blog_authors.name}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-3 h-3 text-primary" />
                                  </div>
                                )}
                                <span className="text-sm text-muted-foreground">
                                  {blog.blog_authors.name}
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Link>
                      </Card>
                    </article>
                  ))
                )}
              </div>
            </main>

            {/* Right Sidebar - Recent Posts & Info */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-4 space-y-4">
                {/* Recent Posts */}
                <Card>
                  <CardHeader className="pb-3">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Son Məqalələr
                    </h2>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <nav className="space-y-3">
                      {recentBlogs.map((blog) => (
                        <Link
                          key={blog.id}
                          href={`/blog/${blog.slug}`}
                          className="block group"
                        >
                          <div className="flex items-start gap-3">
                            {blog.featured_image ? (
                              <img
                                src={blog.featured_image}
                                alt={blog.title}
                                className="w-16 h-12 rounded object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                {blog.title}
                              </h3>
                              {blog.published_at && (
                                <time className="text-xs text-muted-foreground">
                                  {format(new Date(blog.published_at), "d MMM", { locale: az })}
                                </time>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Telegram CTA */}
                <Card className="bg-gradient-to-r from-[#0088cc]/10 to-[#0088cc]/5 border-[#0088cc]/20">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                      </svg>
                    </div>
                    <h3 className="font-semibold mb-2">Telegram Kanalımız</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Ən son məqalələr və vakansiyalardan xəbərdar olun
                    </p>
                    <a
                      href="https://t.me/joobleaz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0088cc] text-white hover:bg-[#0088cc]/90 transition-colors text-sm font-medium"
                    >
                      Qoşul
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
