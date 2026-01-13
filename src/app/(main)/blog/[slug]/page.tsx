import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import BlogPostServerContent from "./BlogPostServerContent";
import { headers } from "next/headers";
import SeoShield from "@/components/SeoShield";
import { SEO_MASTER_KEYWORDS, SEO_HYDRATION_GUIDE } from "@/constants/seo-terms";

function getGooglebotBlogHydration(blogTitle: string): string {
  return `
        <section class="google-hydration-content sr-only">
            <h2>Analitik İcmal: ${blogTitle}</h2>
            <p>Bu məqalə Azərbaycanın rəqəmsal əmək bazarındakı trendləri və ${blogTitle} mövzusundakı son yenilikləri əhatə edir.</p>
            <p>${SEO_HYDRATION_GUIDE}</p>
            <p>Mövzu üzrə ən son texnoloji və hüquqi bazanın semantik təhlili Googlebot üçün optimallaşdırılmışdır.</p>
            <div class="master-keywords">
                ${SEO_MASTER_KEYWORDS.join(', ')}
            </div>
        </section>
    `;
}

interface BlogPostPageProps {
  params: { slug: string };
}

// Create a server-side Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://igrtzfvphltnoiwedbtz.supabase.co",
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0"
);

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
  const { data: relatedBlogs } = await supabase
    .from("blogs")
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      reading_time_minutes,
      blog_authors!inner (
        name,
        avatar_url
      )
    `)
    .eq("is_published", true)
    .eq("is_active", true)
    .neq("id", blogId)
    .order("published_at", { ascending: false })
    .limit(limit);

  // Transform the data to match the expected type
  const transformed = (relatedBlogs || []).map((blog: any) => ({
    ...blog,
    blog_authors: blog.blog_authors ? {
      name: blog.blog_authors.name,
      avatar_url: blog.blog_authors.avatar_url
    } : null
  }));

  return transformed;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const blog = await getBlogPost(params.slug);

  if (!blog) {
    return {
      title: "Məqalə tapılmadı | Jobin.az",
    };
  }

  const title = blog.seo_title || blog.title;
  const description = blog.seo_description || blog.excerpt || "";
  const imageUrl = blog.og_image || blog.featured_image;

  return {
    title: `${title} | Jobin.az Bloq`,
    description,
    keywords: blog.seo_keywords || [],
    openGraph: {
      title: blog.og_title || title,
      description: blog.og_description || description,
      type: "article",
      url: `https://jobin.az/blog/${blog.slug}`,
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
      canonical: blog.canonical_url || `https://jobin.az/blog/${blog.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const userAgent = headers().get('user-agent') || '';
  const isGooglebot = /googlebot/i.test(userAgent);
  const blog = await getBlogPost(params.slug);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = await getRelatedBlogs(blog.id);

  // Process content to add IDs to headings
  let processedContent = blog.content;
  let headingIndex = 0;

  processedContent = processedContent.replace(/<(h[2-6])([^>]*)>(.*?)<\/h[2-6]>/gi, (match: string, tag: string, attrs: string, text: string) => {
    const id = `heading-${headingIndex}`;
    headingIndex++;
    return `<${tag}${attrs} id="${id}">${text}</${tag}>`;
  });

  // Process links for SEO (add rel attributes)
  processedContent = processedContent.replace(/<a([^>]*href="https?:\/\/[^"]*"[^>]*)>/gi, (match: string, attrs: string) => {
    if (!attrs.includes('rel=')) {
      return `<a${attrs} rel="noopener noreferrer" target="_blank">`;
    }
    return match;
  });

  // Extract headings for TOC
  const tocItems: { id: string; text: string; level: number }[] = [];
  const headingRegex = /<h([2-6])[^>]*id="(heading-\d+)"[^>]*>(.*?)<\/h[2-6]>/gi;
  let tocMatch;
  while ((tocMatch = headingRegex.exec(processedContent)) !== null) {
    tocItems.push({
      level: parseInt(tocMatch[1]),
      id: tocMatch[2],
      text: tocMatch[3].replace(/<[^>]*>/g, ''), // Strip HTML tags
    });
  }

  // Generate Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.h1_title || blog.title,
    "description": blog.excerpt,
    "image": blog.featured_image,
    "url": `https://jobin.az/blog/${blog.slug}`,
    "datePublished": blog.published_at,
    "dateModified": blog.updated_at,
    "author": blog.blog_authors ? {
      "@type": "Person",
      "name": blog.blog_authors.name,
      "url": blog.blog_authors.website || `https://jobin.az/blog/author/${blog.blog_authors.slug}`,
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
        "url": "https://jobin.az/icons/icon-512x512.jpg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://jobin.az/blog/${blog.slug}`
    },
    "about": {
      "@type": "Thing",
      "name": "Azərbaycan",
      "sameAs": "https://www.wikidata.org/wiki/Q227"
    },
    "wordCount": blog.content ? blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0,
    "timeRequired": `PT${blog.reading_time_minutes || 1}M`
  };

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `https://jobin.az/blog/${blog.slug}#dataset`,
    "name": `${blog.title} - Data Analiz`,
    "description": "Bu bloq yazısı üzrə semantik və statistik məlumatlar toplusu.",
    "publisher": { "@type": "Organization", "name": "Jobin.az" }
  };

  // Generate Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana səhifə",
        "item": "https://jobin.az"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Bloq",
        "item": "https://jobin.az/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blog.title,
        "item": `https://jobin.az/blog/${blog.slug}`
      }
    ]
  };

  return (
    <>
      {/* Schema Markup - Server rendered for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />

      {/* SEO Content - Server rendered, visible in page source */}
      <article className="sr-only" aria-hidden="true">
        <header>
          <h1>
            <SeoShield text={blog.h1_title || blog.title} as="span" />
          </h1>
          {blog.excerpt && <p>{blog.excerpt}</p>}
          {blog.blog_authors && (
            <p>Müəllif: {blog.blog_authors.name}</p>
          )}
          {blog.published_at && (
            <time dateTime={blog.published_at}>
              {new Date(blog.published_at).toLocaleDateString('az-AZ')}
            </time>
          )}
        </header>
        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      </article>

      {/* Client-side interactive content */}
      <BlogPostServerContent
        blog={{
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          content: processedContent,
          featured_image: blog.featured_image,
          h1_title: blog.h1_title,
          published_at: blog.published_at,
          updated_at: blog.updated_at,
          reading_time_minutes: blog.reading_time_minutes,
          views: blog.views,
          blog_authors: blog.blog_authors,
        }}
        relatedBlogs={relatedBlogs}
        tableOfContents={tocItems}
      />
      {isGooglebot && (
        <div dangerouslySetInnerHTML={{ __html: getGooglebotBlogHydration(blog.title) }} />
      )}
    </>
  );
}
