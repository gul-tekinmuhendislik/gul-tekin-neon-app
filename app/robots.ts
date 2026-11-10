import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'YandexBot',
        allow: '/',
        crawlDelay: 2,
      },
      // Yavaş botlar için crawl delay
      {
        userAgent: 'AhrefsBot',
        allow: '/',
        crawlDelay: 10,
      },
      {
        userAgent: 'SemrushBot',
        allow: '/',
        crawlDelay: 10,
      },
      {
        userAgent: 'MJ12bot',
        allow: '/',
        crawlDelay: 10,
      },
      {
        userAgent: 'DotBot',
        allow: '/',
        crawlDelay: 10,
      },
    ],
    sitemap: 'https://gul-tekinmuhendislik.com/sitemap.xml',
    host: 'https://gul-tekinmuhendislik.com',
  };
}
