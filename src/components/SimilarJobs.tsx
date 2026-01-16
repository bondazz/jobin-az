"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Eye, Send } from "lucide-react";
import VerifyBadge from "@/components/ui/verify-badge";
import Link from "next/link";

interface SimilarJob {
  id: string;
  title: string;
  slug: string;
  location: string;
  salary: string | null;
  views: number;
  created_at: string;
  tags: string[] | null;
  companies: {
    name: string;
    logo: string | null;
    is_verified: boolean;
    slug: string;
  } | null;
}

interface SimilarJobsProps {
  categoryId: string | null;
  currentJobId: string;
  categoryName?: string;
  categorySlug?: string;
  isMobile?: boolean;
}

const DEFAULT_LOGO = "/icons/icon-192x192.jpg";

const SimilarJobs = ({
  categoryId,
  currentJobId,
  categoryName,
  categorySlug,
  isMobile = false,
}: SimilarJobsProps) => {
  const [similarJobs, setSimilarJobs] = useState<SimilarJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryId) {
      fetchSimilarJobs();
    } else {
      setLoading(false);
    }
  }, [categoryId, currentJobId]);

  const fetchSimilarJobs = async () => {
    if (!categoryId) return;

    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(
          `
          id, title, slug, location, salary, views, created_at, tags,
          companies:company_id(name, logo, is_verified, slug)
        `
        )
        .eq("category_id", categoryId)
        .eq("is_active", true)
        .neq("id", currentJobId)
        .or("expiration_date.is.null,expiration_date.gt.now()")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setSimilarJobs((data as SimilarJob[]) || []);
    } catch (error) {
      console.error("Error fetching similar jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Bu gün";
    if (diffDays === 1) return "Dünən";
    if (diffDays < 7) return `${diffDays} gün əvvəl`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} həftə əvvəl`;
    return `${Math.floor(diffDays / 30)} ay əvvəl`;
  };

  // Generate JSON-LD structured data for SEO
  const generateJsonLd = () => {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": categoryName ? `${categoryName} - Oxşar Vakansiyalar` : "Oxşar Vakansiyalar",
      "description": categoryName
        ? `${categoryName} kateqoriyasında ən son iş elanları və vakansiyalar`
        : "Oxşar iş elanları və vakansiyalar",
      "numberOfItems": similarJobs.length,
      "itemListElement": similarJobs.map((job, index) => {
        const postingDate = job.created_at || new Date().toISOString();
        const validThroughDate = new Date(new Date(postingDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "JobPosting",
            "title": job.title,
            "description": `${job.title} vakansiyası ${job.companies?.name || "Jobin tərəfdaşı"} şirkətində.`,
            "datePosted": postingDate,
            "validThrough": validThroughDate,
            "employmentType": "FULL_TIME",
            "url": `https://jobin.az/vacancies/${job.slug}`,
            "hiringOrganization": {
              "@type": "Organization",
              "name": job.companies?.name || "Jobin",
              "logo": job.companies?.logo || "https://jobin.az/icons/icon-512x512.jpg"
            },
            "jobLocation": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": job.location || 'Bakı',
                "addressLocality": job.location || 'Bakı',
                "addressRegion": "Bakı",
                "postalCode": "AZ1000",
                "addressCountry": "AZ"
              }
            },
            "baseSalary": {
              "@type": "MonetaryAmount",
              "currency": "AZN",
              "value": {
                "@type": "QuantitativeValue",
                "value": job.salary && !isNaN(parseFloat(job.salary)) ? parseFloat(job.salary) : 500,
                "minValue": job.salary && !isNaN(parseFloat(job.salary)) ? parseFloat(job.salary) : 500,
                "maxValue": job.salary && !isNaN(parseFloat(job.salary)) ? parseFloat(job.salary) * 1.5 : 1500,
                "unitText": "MONTH"
              }
            }
          }
        };
      })
    };
  };

  if (!categoryId || loading) {
    return null;
  }

  if (similarJobs.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 mb-6">
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd()) }}
      />
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
          <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-foreground`}>
            Oxşar Vakansiyalar
          </h2>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-3`}>
        {similarJobs.map((job, index) => {
          const isPremium = job.tags?.includes("premium");

          return (
            <Link
              key={job.id}
              href={`/vacancies/${job.slug}`}
              className={`
                group relative overflow-hidden rounded-xl border p-4 transition-all duration-300
                hover:shadow-lg hover:-translate-y-1 hover:border-primary/40
                ${isPremium
                  ? "bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border-amber-200/60 dark:border-amber-700/40"
                  : "bg-card border-border/50 hover:bg-accent/30"
                }
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Premium Badge */}
              {isPremium && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-xl shadow-sm">
                    Premium
                  </div>
                </div>
              )}

              {/* Card Content */}
              <div className="flex gap-3">
                {/* Company Logo */}
                <div className="flex-shrink-0">
                  <div className={`
                    w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300
                    ${isPremium ? "border-amber-300 dark:border-amber-600" : "border-border group-hover:border-primary/40"}
                  `}>
                    <img
                      src={job.companies?.logo || DEFAULT_LOGO}
                      alt={job.companies?.name || "Şirkət"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== window.location.origin + DEFAULT_LOGO) {
                          target.src = DEFAULT_LOGO;
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  {/* Job Title */}
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {job.title}
                  </h3>

                  {/* Company Name */}
                  <div className="flex items-center gap-1 mt-1">
                    <Building className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {job.companies?.name || "Şirkət"}
                    </span>
                    {job.companies?.is_verified && (
                      <VerifyBadge size={10} className="flex-shrink-0" />
                    )}
                  </div>

                  {/* Location & Meta */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[80px]">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      <span>{job.views}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer: Salary & Date */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                {job.salary ? (
                  <span className="text-xs font-semibold text-primary">
                    {job.salary}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    Maaş göstərilməyib
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {formatDate(job.created_at)}
                </span>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Link>
          );
        })}
      </div>

      {/* Telegram Channel Promotion - External Link for SEO */}
      <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-[#0088cc]/10 to-[#0088cc]/5 dark:from-[#0088cc]/20 dark:to-[#0088cc]/10 border border-[#0088cc]/20">
        <div className="flex items-center justify-center gap-3 flex-wrap text-center">
          <Send className="w-5 h-5 text-[#0088cc]" />
          <p className="text-sm text-foreground">
            Vakansiyalar barədə məlumatı ən tez bizim{" "}
            <a
              href="https://t.me/Jobinaz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#0088cc] hover:text-[#006699] hover:underline transition-colors"
            >
              Telegram kanalında
            </a>
            {" "}izləyə bilərsiniz.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SimilarJobs;
