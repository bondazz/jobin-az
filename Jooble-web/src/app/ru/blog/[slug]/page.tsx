import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import BlogPostServerContent from "@/app/(main)/blog/[slug]/BlogPostServerContent";

interface BlogPostPageProps {
    params: { slug: string };
}

const supabase = createClient(
    "https://igrtzfvphltnoiwedbtz.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0"
);

async function getBlogPost(slug: string) {
    const { data: blog, error } = await supabase
        .from("blogs")
        .select(`*, blog_authors (id, name, slug, bio, avatar_url)`)
        .eq("slug", slug)
        .eq("is_published", true)
        .eq("is_active", true)
        .single();

    if (error || !blog) return null;
    return blog;
}

async function getRelatedBlogs(blogId: string, limit: number = 3) {
    const { data: relatedBlogs } = await supabase
        .from("blogs")
        .select(`id, title, slug, excerpt, featured_image, published_at, reading_time_minutes, blog_authors!inner (name, avatar_url)`)
        .eq("is_published", true)
        .eq("is_active", true)
        .neq("id", blogId)
        .order("published_at", { ascending: false })
        .limit(limit);

    return (relatedBlogs || []).map((blog: any) => ({
        ...blog,
        blog_authors: blog.blog_authors ? { name: blog.blog_authors.name, avatar_url: blog.blog_authors.avatar_url } : null
    }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const blog = await getBlogPost(params.slug);

    if (!blog) {
        return { title: "Статья не найдена | Jooble.az" };
    }

    const title = blog.seo_title || blog.title;
    const description = blog.seo_description || blog.excerpt || "";

    return {
        title: `${title} | Блог Jooble.az`,
        description,
        openGraph: {
            title: blog.og_title || title,
            description: blog.og_description || description,
            type: "article",
            url: `https://jooble.az/ru/blog/${blog.slug}`,
            images: blog.featured_image ? [blog.featured_image] : undefined,
        },
        alternates: {
            canonical: `https://jooble.az/ru/blog/${blog.slug}`,
            languages: {
                'az': `https://jooble.az/blog/${blog.slug}`,
                'en': `https://jooble.az/en/blog/${blog.slug}`,
                'ru': `https://jooble.az/ru/blog/${blog.slug}`,
                'x-default': `https://jooble.az/blog/${blog.slug}`,
            },
        },
    };
}

export default async function RuBlogPostPage({ params }: BlogPostPageProps) {
    const blog = await getBlogPost(params.slug);

    if (!blog) {
        notFound();
    }

    const relatedBlogs = await getRelatedBlogs(blog.id);

    let processedContent = blog.content;
    let headingIndex = 0;
    processedContent = processedContent.replace(/<(h[2-6])([^>]*)>(.*?)<\/h[2-6]>/gi, (match: string, tag: string, attrs: string, text: string) => {
        const id = `heading-${headingIndex}`;
        headingIndex++;
        return `<${tag}${attrs} id="${id}">${text}</${tag}>`;
    });

    const tocItems: { id: string; text: string; level: number }[] = [];
    const headingRegex = /<h([2-6])[^>]*id="(heading-\d+)"[^>]*>(.*?)<\/h[2-6]>/gi;
    let tocMatch;
    while ((tocMatch = headingRegex.exec(processedContent)) !== null) {
        tocItems.push({ level: parseInt(tocMatch[1]), id: tocMatch[2], text: tocMatch[3].replace(/<[^>]*>/g, '') });
    }

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": blog.h1_title || blog.title,
        "url": `https://jooble.az/ru/blog/${blog.slug}`,
        "datePublished": blog.published_at,
        "author": blog.blog_authors ? { "@type": "Person", "name": blog.blog_authors.name } : { "@type": "Organization", "name": "Jooble.az" },
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://jooble.az/ru" },
            { "@type": "ListItem", "position": 2, "name": "Блог", "item": "https://jooble.az/ru/blog" },
            { "@type": "ListItem", "position": 3, "name": blog.title, "item": `https://jooble.az/ru/blog/${blog.slug}` }
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <article className="sr-only">
                <h1>{blog.h1_title || blog.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </article>
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
        </>
    );
}
