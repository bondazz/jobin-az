"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import {
  Clock,
  Eye,
  Calendar,
  User,
  List,
  Linkedin,
  Twitter,
  Facebook,
  Link as LinkIcon,
  ArrowUp,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import SEOBreadcrumb from "@/components/SEOBreadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BlogAuthor {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  h1_title: string | null;
  published_at: string | null;
  updated_at: string;
  reading_time_minutes: number | null;
  views: number | null;
  blog_authors: BlogAuthor | null;
}

interface RelatedBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  reading_time_minutes: number | null;
  blog_authors: {
    name: string;
    avatar_url: string | null;
  } | null;
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface BlogPostServerContentProps {
  blog: Blog;
  relatedBlogs: RelatedBlog[];
  tableOfContents: TOCItem[];
}

export default function BlogPostServerContent({
  blog,
  relatedBlogs,
  tableOfContents,
}: BlogPostServerContentProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Increment view count
  useEffect(() => {
    const incrementViews = async () => {
      try {
        await supabase.rpc("increment_blog_views", { blog_id: blog.id });
      } catch (error) {
        console.error("Error incrementing views:", error);
      }
    };
    incrementViews();
  }, [blog.id]);

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = async (platform: string) => {
    const url = `https://jobin.az/blog/${blog.slug}`;
    const title = blog.title;

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "copy":
        await navigator.clipboard.writeText(url);
        toast.success("Link kopyalandı!");
        break;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-screen">
        <div className="container mx-auto px-4 py-6 pb-24 lg:pb-6">
          {/* Breadcrumb - SEO */}
          <SEOBreadcrumb
            items={[
              { label: "Bloq", href: "/blog" },
              { label: blog.title },
            ]}
            className="mb-4"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Table of Contents (Desktop) */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-4 space-y-4">
                {/* Table of Contents */}
                {tableOfContents.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <h2 className="text-sm font-semibold flex items-center gap-2">
                        <List className="w-4 h-4 text-primary" />
                        Mündəricat
                      </h2>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <nav className="space-y-1">
                        {tableOfContents.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted line-clamp-2 ${
                              activeSection === item.id
                                ? "text-primary font-medium bg-primary/5"
                                : "text-muted-foreground"
                            }`}
                            style={{ paddingLeft: `${(item.level - 2) * 12 + 8}px` }}
                          >
                            {item.text}
                          </button>
                        ))}
                      </nav>
                    </CardContent>
                  </Card>
                )}

                {/* Reading Info */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{blog.reading_time_minutes || 1} dəqiqə oxuma</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4 text-primary" />
                        <span>{blog.views || 0} baxış</span>
                      </div>
                      {blog.published_at && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          <time dateTime={blog.published_at}>
                            {format(new Date(blog.published_at), "d MMM yyyy", { locale: az })}
                          </time>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-6">
              <article>
                {/* Featured Image */}
                {blog.featured_image && (
                  <div className="aspect-video rounded-xl overflow-hidden mb-6">
                    <img
                      src={blog.featured_image}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Article Header */}
                <header className="mb-6">
                  {/* Meta info for mobile */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4 lg:hidden">
                    {blog.published_at && (
                      <time dateTime={blog.published_at} className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(blog.published_at), "d MMM yyyy", { locale: az })}
                      </time>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {blog.reading_time_minutes || 1} dəq
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {blog.views}
                    </span>
                  </div>

                  {/* H1 Title */}
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {blog.h1_title || blog.title}
                  </h1>

                  {/* Author with Share Buttons */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50">
                    {blog.blog_authors ? (
                      <div className="flex items-center gap-3">
                        {blog.blog_authors.avatar_url ? (
                          <img
                            src={blog.blog_authors.avatar_url}
                            alt={blog.blog_authors.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{blog.blog_authors.name}</p>
                          {blog.blog_authors.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {blog.blog_authors.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div />
                    )}

                    {/* Share Buttons - next to author */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShare("twitter")}
                        className="rounded-full h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      >
                        <Twitter className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShare("facebook")}
                        className="rounded-full h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      >
                        <Facebook className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShare("linkedin")}
                        className="rounded-full h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      >
                        <Linkedin className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShare("copy")}
                        className="rounded-full h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </header>

                <Separator className="mb-6" />

                {/* Article Content - Server rendered HTML */}
                <div
                  className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:scroll-mt-20
                    prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                    prose-h4:text-base prose-h4:font-semibold prose-h4:mt-4 prose-h4:mb-2
                    prose-h5:text-sm prose-h5:font-semibold prose-h5:mt-4 prose-h5:mb-2
                    prose-h6:text-sm prose-h6:font-medium prose-h6:mt-3 prose-h6:mb-2
                    prose-p:text-foreground/90 prose-p:leading-relaxed
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground
                    prose-ul:my-4 prose-ol:my-4
                    prose-li:my-1
                    prose-img:rounded-lg
                    prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg prose-blockquote:py-1
                  "
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                <Separator className="my-8" />

                {/* Related Posts */}
                {relatedBlogs.length > 0 && (
                  <section className="mt-12">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Oxşar Məqalələr
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {relatedBlogs.map((related) => (
                        <Link key={related.id} href={`/blog/${related.slug}`}>
                          <Card className="h-full hover:shadow-lg transition-shadow group">
                            {related.featured_image && (
                              <div className="aspect-video overflow-hidden">
                                <img
                                  src={related.featured_image}
                                  alt={related.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <CardContent className="p-3">
                              <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors text-sm">
                                {related.title}
                              </h3>
                              {related.reading_time_minutes && (
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {related.reading_time_minutes} dəq
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </article>
            </main>

            {/* Right Sidebar - Author & Social */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-4 space-y-4">
                {/* Author Card */}
                {blog.blog_authors && (
                  <Card>
                    <CardHeader className="pb-3">
                      <h2 className="text-sm font-semibold flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        Müəllif haqqında
                      </h2>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-center">
                        {blog.blog_authors.avatar_url ? (
                          <img
                            src={blog.blog_authors.avatar_url}
                            alt={blog.blog_authors.name}
                            className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                            <User className="w-8 h-8 text-primary" />
                          </div>
                        )}
                        <h3 className="font-semibold">{blog.blog_authors.name}</h3>
                        {blog.blog_authors.bio && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                            {blog.blog_authors.bio}
                          </p>
                        )}
                        {/* Author Social Links */}
                        <div className="flex justify-center gap-2 mt-3">
                          {blog.blog_authors.twitter && (
                            <Link
                              href={blog.blog_authors.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Twitter className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                          {blog.blog_authors.linkedin && (
                            <Link
                              href={blog.blog_authors.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Linkedin className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                          {blog.blog_authors.website && (
                            <Link
                              href={blog.blog_authors.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <LinkIcon className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </aside>
          </div>
        </div>
      </ScrollArea>

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          variant="outline"
          size="icon"
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-50 rounded-full shadow-lg"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
