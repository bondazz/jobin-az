import { Metadata } from "next";
import { supabase } from "@/integrations/supabase/client";

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

export default function BlogPostPage({ params }: BlogPostPageProps) {
  // This page just provides metadata, the layout handles rendering BlogClient
  // The slug is handled by the BlogClient component
  return null;
}
