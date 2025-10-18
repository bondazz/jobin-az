import { useEffect } from "react";

const RobotsTxt = () => {
  useEffect(() => {
    // Set the content type to plain text
    document.querySelector("html")?.setAttribute("data-content-type", "text/plain");

    // Return a cleanup function to reset the content type
    return () => {
      document.querySelector("html")?.removeAttribute("data-content-type");
    };
  }, []);

  return (
    <pre
      style={{
        fontFamily: "monospace",
        fontSize: "14px",
        whiteSpace: "pre-wrap",
        margin: 0,
        padding: "20px",
        backgroundColor: "#f5f5f5",
        color: "#333",
      }}
    >
      {`# Robots.txt for jooble.az
# SEO optimized configuration

# Allow all crawlers access to all content
User-agent: *
Allow: /

# Specific crawler permissions
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Yandexbot
Allow: /
Crawl-delay: 1

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

# Prevent crawling of admin areas
User-agent: *
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Sitemaps
Sitemap: https://storage.jooble.az/public/sitemap.xml
Sitemap: https://storage.jooble.az/sitemap.xml

# Host declaration
Host: jooble.az`}
    </pre>
  );
};

export default RobotsTxt;
