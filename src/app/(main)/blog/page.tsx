import { Metadata } from "next";
import { supabase } from "@/integrations/supabase/client";
import BlogListClient from "@/components/BlogListClient";

export const metadata: Metadata = {
  title: "Bloq | Jooble.az - Karyera Məqalələri və İş Axtarışı Məsləhətləri",
  description: "Karyera inkişafı, iş axtarışı, CV yazma, müsahibə hazırlığı və əmək bazarı haqqında ən son məqalələr. Jooble.az bloqu ilə karyeranızı inkişaf etdirin.",
  keywords: ["karyera", "iş axtarışı", "CV", "müsahibə", "əmək bazarı", "bloq", "məqalə"],
  openGraph: {
    title: "Bloq | Jooble.az - Karyera Məqalələri",
    description: "Karyera inkişafı və iş axtarışı haqqında məqalələr",
    type: "website",
    url: "https://jooble.az/blog",
  },
};

async function getBlogs() {
  const { data: blogs, error } = await supabase
    .from("blogs")
    .select(`
      *,
      blog_authors (
        id,
        name,
        slug,
        avatar_url
      )
    `)
    .eq("is_published", true)
    .eq("is_active", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }

  return blogs || [];
}

async function getBlogCategories() {
  const { data: categories, error } = await supabase
    .from("blog_categories")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Error fetching blog categories:", error);
    return [];
  }

  return categories || [];
}

export default async function BlogPage() {
  const [blogs, categories] = await Promise.all([
    getBlogs(),
    getBlogCategories(),
  ]);

  // Generate JSON-LD for Blog listing
  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Jooble.az Bloq",
    "description": "Karyera inkişafı, iş axtarışı və əmək bazarı haqqında məqalələr",
    "url": "https://jooble.az/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Jooble.az",
      "logo": {
        "@type": "ImageObject",
        "url": "https://jooble.az/icons/icon-512x512.jpg"
      }
    },
    "blogPost": blogs.slice(0, 10).map((blog: any) => ({
      "@type": "BlogPosting",
      "headline": blog.title,
      "description": blog.excerpt || blog.seo_description,
      "url": `https://jooble.az/blog/${blog.slug}`,
      "datePublished": blog.published_at,
      "dateModified": blog.updated_at,
      "author": blog.blog_authors ? {
        "@type": "Person",
        "name": blog.blog_authors.name
      } : undefined
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />
      <BlogListClient blogs={blogs} categories={categories} />
    </>
  );
}
