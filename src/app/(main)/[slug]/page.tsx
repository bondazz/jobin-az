import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import CustomPageContent from './CustomPageContent';

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

const supabase = createClient(supabaseUrl, supabaseKey);

interface CustomPage {
  id: string;
  slug: string;
  seo_title: string;
  seo_description: string | null;
  seo_keywords: string[] | null;
  canonical_url: string | null;
  content: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  schema_type: string | null;
  is_active: boolean;
}

async function getPage(slug: string): Promise<CustomPage | null> {
  const decodedSlug = decodeURIComponent(slug);
  const slugsToTry = [decodedSlug, `/${decodedSlug}`];
  
  for (const trySlug of slugsToTry) {
    const { data } = await supabase
      .from('custom_pages')
      .select('*')
      .eq('slug', trySlug)
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      return data;
    }
  }
  
  return null;
}

// Generate metadata server-side for proper SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getPage(params.slug);
  
  if (!page) {
    return {
      title: 'Səhifə tapılmadı | Jobin.az',
      description: 'Axtardığınız səhifə tapılmadı.',
    };
  }

  const canonicalUrl = page.canonical_url || `https://jobin.az${page.slug.startsWith('/') ? page.slug : '/' + page.slug}`;

  return {
    title: page.seo_title,
    description: page.seo_description,
    keywords: page.seo_keywords?.join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.og_title || page.seo_title,
      description: page.og_description || page.seo_description || undefined,
      url: canonicalUrl,
      siteName: 'Jobin.az',
      type: 'website',
      images: page.og_image ? [{ url: page.og_image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.twitter_title || page.seo_title,
      description: page.twitter_description || page.seo_description || undefined,
      images: page.og_image ? [page.og_image] : undefined,
    },
    other: {
      'og:locale': 'az_AZ',
    },
  };
}

export default async function CustomPageRoute({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);

  // If page not found or not active, show Next.js 404 page
  if (!page) {
    notFound();
  }

  // Generate JSON-LD schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': page.schema_type || 'WebPage',
    name: page.seo_title,
    description: page.seo_description,
    url: page.canonical_url || `https://jobin.az${page.slug.startsWith('/') ? page.slug : '/' + page.slug}`,
    image: page.og_image,
    publisher: {
      '@type': 'Organization',
      name: 'Jobin.az',
      logo: {
        '@type': 'ImageObject',
        url: 'https://jobin.az/icons/icon-512x512.jpg'
      }
    }
  };

  return (
    <>
      {/* JSON-LD Schema - Server rendered */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <CustomPageContent page={page} />
    </>
  );
}
