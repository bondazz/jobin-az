import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import BlogPostClient from "@/components/BlogPostClient";

interface BlogPostPageProps {
  params: { slug: string };
}

async function getBlogPost(slug: string) {
  const { data: blog, error } = await supabase
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
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("is_active", true)
    .single();

  if (error || !blog) {
    return null;
  }

  return blog;
}

async function getRelatedBlogs(blogId: string, limit: number = 3) {
  const { data: blogs, error } = await supabase
    .from("blogs")
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      reading_time_minutes,
      blog_authors (
        name,
        avatar_url
      )
    `)
    .eq("is_published", true)
    .eq("is_active", true)
    .neq("id", blogId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return blogs || [];
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const blog = await getBlogPost(params.slug);

  if (!blog) {
    return {
      title: "Məqalə tapılmadı | Jooble.az",
    };
  }

  const title = blog.seo_title || blog.title;
  const description = blog.seo_description || blog.excerpt || "";

  const imageUrl = blog.og_image || blog.featured_image;

  return {
    title: `${title} | Jooble.az Bloq`,
    description,
    keywords: blog.seo_keywords || [],
    openGraph: {
      title: blog.og_title || title,
      description: blog.og_description || description,
      type: "article",
      url: `https://jooble.az/blog/${blog.slug}`,
      images: imageUrl ? [imageUrl] : undefined,
      publishedTime: blog.published_at || undefined,
      modifiedTime: blog.updated_at,
      authors: blog.blog_authors?.name ? [blog.blog_authors.name] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.twitter_title || title,
      description: blog.twitter_description || description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: {
      canonical: blog.canonical_url || `https://jooble.az/blog/${blog.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const blog = await getBlogPost(params.slug);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = await getRelatedBlogs(blog.id);

  // Generate Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": blog.schema_type || "Article",
    "headline": blog.h1_title || blog.title,
    "description": blog.seo_description || blog.excerpt,
    "image": blog.featured_image || blog.og_image,
    "url": `https://jooble.az/blog/${blog.slug}`,
    "datePublished": blog.published_at,
    "dateModified": blog.updated_at,
    "author": blog.blog_authors ? {
      "@type": "Person",
      "name": blog.blog_authors.name,
      "url": blog.blog_authors.website || `https://jooble.az/blog/author/${blog.blog_authors.slug}`,
      "image": blog.blog_authors.avatar_url,
      "sameAs": [
        blog.blog_authors.twitter,
        blog.blog_authors.linkedin,
        blog.blog_authors.website
      ].filter(Boolean)
    } : {
      "@type": "Organization",
      "name": "Jooble.az"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Jooble.az",
      "logo": {
        "@type": "ImageObject",
        "url": "https://jooble.az/icons/icon-512x512.jpg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://jooble.az/blog/${blog.slug}`
    },
    "wordCount": blog.content ? blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0,
    "timeRequired": `PT${blog.reading_time_minutes || 1}M`
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana səhifə",
        "item": "https://jooble.az"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Bloq",
        "item": "https://jooble.az/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blog.title,
        "item": `https://jooble.az/blog/${blog.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogPostClient blog={blog} relatedBlogs={relatedBlogs} />
    </>
  );
}
