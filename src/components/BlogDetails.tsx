"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import {
  Clock,
  Eye,
  Calendar,
  User,
  Share2,
  BookOpen,
  List,
  Linkedin,
  Twitter,
  Facebook,
  Link as LinkIcon,
  ArrowUp,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import SEOBreadcrumb from "@/components/SEOBreadcrumb";
import SimilarBlogs from "@/components/SimilarBlogs";
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

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface BlogDetailsProps {
  blogId: string | null;
  isMobile?: boolean;
}

export default function BlogDetails({ blogId, isMobile = false }: BlogDetailsProps) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [tableOfContents, setTableOfContents] = useState<TOCItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch blog details
  useEffect(() => {
    if (!blogId) {
      setBlog(null);
      return;
    }

    const fetchBlog = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("blogs")
          .select(`
            *,
            blog_authors (
              id,
              name,
              slug,
              bio,
              avatar_url,
              website,
              twitter,
              linkedin
            )
          `)
          .eq("id", blogId)
          .single();

        if (!error && data) {
          setBlog(data);
          // Increment view count
          await supabase.rpc("increment_blog_views", { blog_id: blogId });
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  // Extract headings for Table of Contents
  useEffect(() => {
    if (!blog?.content) {
      setTableOfContents([]);
      return;
    }

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
  }, [blog?.content]);

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Process content to add IDs to headings
  const processedContent = useMemo(() => {
    if (!blog?.content) return "";
    
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
  }, [blog?.content]);

  // Generate Article Schema
  const generateArticleSchema = () => {
    if (!blog) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": blog.h1_title || blog.title,
      "description": blog.excerpt,
      "image": blog.featured_image,
      "url": `https://Jobin.az/blog/${blog.slug}`,
      "datePublished": blog.published_at,
      "dateModified": blog.updated_at,
      "author": blog.blog_authors ? {
        "@type": "Person",
        "name": blog.blog_authors.name,
        "url": blog.blog_authors.website || `https://Jobin.az/blog/author/${blog.blog_authors.slug}`,
        "image": blog.blog_authors.avatar_url
      } : {
        "@type": "Organization",
        "name": "Jobin.az"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Jobin.az",
        "logo": {
          "@type": "ImageObject",
          "url": "https://Jobin.az/icons/icon-512x512.jpg"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://Jobin.az/blog/${blog.slug}`
      },
      "wordCount": blog.content ? blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0,
      "timeRequired": `PT${blog.reading_time_minutes || 1}M`
    };
  };

  // Generate Breadcrumb Schema
  const generateBreadcrumbSchema = () => {
    if (!blog) return null;
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Ana səhifə",
          "item": "https://Jobin.az"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Bloq",
          "item": "https://Jobin.az/blog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": blog.title,
          "item": `https://Jobin.az/blog/${blog.slug}`
        }
      ]
    };
  };

  const handleShare = async (platform: string) => {
    if (!blog) return;
    const url = `https://Jobin.az/blog/${blog.slug}`;
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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Empty state
  if (!blogId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <BookOpen className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Bloq Məqalələri</h2>
        <p className="text-muted-foreground max-w-md">
          Karyera inkişafı, iş axtarışı və əmək bazarı haqqında faydalı məqalələr. 
          Sol tərəfdəki siyahıdan oxumaq istədiyiniz məqaləni seçin.
        </p>

        {/* Telegram CTA */}
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-[#0088cc]/10 to-[#0088cc]/5 border border-[#0088cc]/20 max-w-sm">
          <div className="flex items-center justify-center gap-3 flex-wrap text-center">
            <Send className="w-5 h-5 text-[#0088cc]" />
            <p className="text-sm text-foreground">
              Ən son məqalələr haqqında xəbərdar olmaq üçün{" "}
              <Link
                href="https://t.me/Jobinaz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#0088cc] hover:text-[#006699] hover:underline transition-colors"
              >
                Telegram kanalımıza
              </Link>
              {" "}qoşulun.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <Skeleton className="aspect-video w-full mb-6" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </ScrollArea>
    );
  }

  if (!blog) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Məqalə tapılmadı</p>
      </div>
    );
  }

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateArticleSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema()) }}
      />

      <ScrollArea className="h-full">
        <article className={`${isMobile ? 'p-4' : 'p-6'}`}>
          {/* Breadcrumb - Hidden visually but visible for SEO/bots */}
          <div className="sr-only" aria-hidden="false">
            <SEOBreadcrumb
              items={[
                { label: "Bloq", href: "/blog" },
                { label: blog.title },
              ]}
            />
          </div>

          {/* Featured Image - Fixed positioning for mobile/tablet */}
          {blog.featured_image && (
            <div className={`rounded-xl overflow-hidden mb-4 ${isMobile ? 'aspect-video mt-0' : 'h-48 md:h-56'}`}>
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            {blog.published_at && (
              <time dateTime={blog.published_at} className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(blog.published_at), "d MMM yyyy", { locale: az })}
              </time>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {blog.reading_time_minutes || 1} dəq oxuma
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {blog.views || 0} baxış
            </span>
          </div>

          {/* H1 Title - Admin paneldəki h1_title */}
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-3">
            {blog.h1_title || blog.title}
          </h1>

          {/* Author with Share Buttons */}
          <div className="flex items-center justify-between gap-2 mb-4">
            {blog.blog_authors ? (
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
                <span className="text-sm text-muted-foreground">{blog.blog_authors.name}</span>
              </div>
            ) : (
              <div />
            )}
            
            {/* Share Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShare("twitter")}
                className="rounded-full h-7 w-7 hover:bg-primary/10 hover:text-primary"
              >
                <Twitter className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShare("facebook")}
                className="rounded-full h-7 w-7 hover:bg-primary/10 hover:text-primary"
              >
                <Facebook className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShare("linkedin")}
                className="rounded-full h-7 w-7 hover:bg-primary/10 hover:text-primary"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShare("copy")}
                className="rounded-full h-7 w-7 hover:bg-primary/10 hover:text-primary"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Table of Contents - Mobile only */}
          {isMobile && tableOfContents.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <List className="w-4 h-4 text-primary" />
                  Mündəricat
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <nav className="space-y-1">
                  {tableOfContents.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="w-full text-left px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted line-clamp-1 text-muted-foreground"
                    >
                      {item.text}
                    </button>
                  ))}
                  {tableOfContents.length > 5 && (
                    <p className="text-xs text-muted-foreground px-2">
                      +{tableOfContents.length - 5} daha çox başlıq
                    </p>
                  )}
                </nav>
              </CardContent>
            </Card>
          )}

          <Separator className="mb-6" />

          {/* Article Content - Cleaner, less tiring styling */}
          <div
            className="prose prose-sm md:prose-base dark:prose-invert max-w-none
              prose-headings:scroll-mt-20 prose-headings:text-foreground
              prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-primary/30 prose-h2:pb-2
              prose-h3:text-base prose-h3:font-medium prose-h3:mt-4 prose-h3:mb-2
              prose-h4:text-sm prose-h4:font-medium prose-h4:mt-3 prose-h4:mb-2
              prose-p:text-foreground/90 prose-p:leading-7 prose-p:my-3
              prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
              prose-strong:text-primary prose-strong:font-semibold
              prose-ul:my-4 prose-ol:my-4 prose-ul:pl-0 prose-ol:pl-6
              prose-li:my-2 prose-li:text-foreground/90 prose-li:leading-relaxed
              prose-img:rounded-lg prose-img:my-4
              prose-blockquote:border-l-primary prose-blockquote:bg-muted/20 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-foreground/80
              [&_ol]:list-decimal
              [&_ul]:list-none [&_ul]:space-y-2
              [&_ul>li]:relative [&_ul>li]:pl-6
              [&_ul>li]:before:content-['•'] [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:text-primary [&_ul>li]:before:font-bold [&_ul>li]:before:text-lg
            "
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />

          {/* Similar Blogs Section */}
          <SimilarBlogs currentBlogId={blog.id} isMobile={isMobile} />
        </article>
      </ScrollArea>

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          variant="default"
          size="icon"
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 rounded-full shadow-lg z-50"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      )}
    </>
  );
}
