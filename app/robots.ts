import { MetadataRoute } from "next";
import { siteConfig } from "./metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/static/", "/admin/"],
        crawlDelay: 1,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        crawlDelay: 0,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}