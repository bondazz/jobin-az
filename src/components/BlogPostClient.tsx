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
  Share2,
  ChevronRight,
  BookOpen,
  List,
  Linkedin,
  Twitter,
  Facebook,
  Link as LinkIcon,
  ArrowUp,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface BlogPostClientProps {
  blog: Blog;
  relatedBlogs: RelatedBlog[];
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export default function BlogPostClient({ blog, relatedBlogs }: BlogPostClientProps) {
  const [tableOfContents, setTableOfContents] = useState<TOCItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Extract headings from content for Table of Contents
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(blog.content, "text/html");
    const headings = doc.querySelectorAll("h2, h3, h4, h5, h6");
    
    const toc: TOCItem[] = [];
    headings.forEach((heading, index) => {
      const id = `heading-${index}`;
      const text = heading.textContent || "";
      const level = parseInt(heading.tagName.charAt(1));
      toc.push({ id, text, level });
    });
    
    setTableOfContents(toc);
  }, [blog.content]);

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

  // Process content to add IDs to headings
  const processedContent = React.useMemo(() => {
    let content = blog.content;
    let headingIndex = 0;
    
    content = content.replace(/<(h[2-6])([^>]*)>(.*?)<\/h[2-6]>/gi, (match, tag, attrs, text) => {
      const id = `heading-${headingIndex}`;
      headingIndex++;
      return `<${tag}${attrs} id="${id}">${text}</${tag}>`;
    });

    // Process links for SEO (add rel attributes)
    content = content.replace(/<a([^>]*href="https?:\/\/[^"]*"[^>]*)>/gi, (match, attrs) => {
      if (!attrs.includes('rel=')) {
        return `<a${attrs} rel="noopener noreferrer" target="_blank">`;
      }
      return match;
    });

    return content;
  }, [blog.content]);

  const handleShare = async (platform: string) => {
    const url = `https://jooble.az/blog/${blog.slug}`;
    const title = blog.title;

    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
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

                  {/* Author */}
                  {blog.blog_authors && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
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
                  )}
                </header>

                <Separator className="mb-6" />

                {/* Article Content */}
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
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                />

                <Separator className="my-8" />

                {/* Share Buttons */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Paylaş:
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare("twitter")}
                      className="rounded-full"
                    >
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare("facebook")}
                      className="rounded-full"
                    >
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare("linkedin")}
                      className="rounded-full"
                    >
                      <Linkedin className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare("copy")}
                      className="rounded-full"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

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
                          <p className="text-sm text-muted-foreground mt-2">
                            {blog.blog_authors.bio}
                          </p>
                        )}
                        {/* Author Social Links */}
                        <div className="flex items-center justify-center gap-2 mt-4">
                          {blog.blog_authors.twitter && (
                            <a
                              href={blog.blog_authors.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Twitter className="w-4 h-4" />
                            </a>
                          )}
                          {blog.blog_authors.linkedin && (
                            <a
                              href={blog.blog_authors.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                          {blog.blog_authors.website && (
                            <a
                              href={blog.blog_authors.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                      Ən son məqalələrdən xəbərdar olun
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

                {/* Back to Blog */}
                <Link href="/blog">
                  <Button variant="outline" className="w-full">
                    ← Bloqun hamısı
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </ScrollArea>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-50"
          aria-label="Yuxarı qayıt"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
