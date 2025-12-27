"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface SEOBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  visuallyHidden?: boolean; // Hide from visual design but visible to bots/screen readers
}

const SEOBreadcrumb = ({ items, className = "", visuallyHidden = false }: SEOBreadcrumbProps) => {
  // Generate Schema.org BreadcrumbList structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana səhifə",
        "item": "https://jooble.az"
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        ...(item.href ? { "item": `https://jooble.az${item.href}` } : {})
      }))
    ]
  };

  // If visually hidden, use sr-only class - visible to bots and screen readers but not visually
  const navClassName = visuallyHidden
    ? "sr-only"
    : `flex items-center flex-wrap gap-1 text-sm ${className}`;

  return (
    <>
      {/* Schema.org structured data - always invisible, always crawlable */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumb navigation - can be visually hidden but still in DOM for SEO */}
      <nav
        aria-label="Breadcrumb"
        className={navClassName}
      >
        <ol className="flex items-center flex-wrap gap-1" itemScope itemType="https://schema.org/BreadcrumbList">
          {/* Home */}
          <li
            className="flex items-center"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <Link
              href="/"
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors group"
              itemProp="item"
            >
              <Home className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span itemProp="name" className="sr-only sm:not-sr-only">Ana səhifə</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>

          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 mx-1 flex-shrink-0" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors truncate max-w-[150px] sm:max-w-[200px]"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span
                  className="text-foreground font-medium truncate max-w-[150px] sm:max-w-[250px]"
                  itemProp="name"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
              <meta itemProp="position" content={String(index + 2)} />
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default SEOBreadcrumb;
