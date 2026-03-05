import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* SEO and Performance Optimizations */
  poweredByHeader: false,

  /* Build Performance */
  typescript: {
    // Skip type checking during build (already done in CI/CD)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build (already done in CI/CD)
    ignoreDuringBuilds: true,
  },

  /* Experimental Performance Features */
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },

  /* Image Optimization — unoptimized: Vercel free plan limit aşıldı (402), Cloudinary zaten optimize ediyor */
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'v5.airtableusercontent.com',
        pathname: '/**',
      },
    ],
  },
  
  /* Performance */
  reactStrictMode: true,
  
  /* Headers for Security and SEO */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  
  /* Redirects for SEO */
  async redirects() {
    return [
      {
        source: "/index",
        destination: "/",
        permanent: true,
      },
      // Eski URL'lerden yeni URL'lere yönlendirmeler
      {
        source: "/yataysudepolari",
        destination: "/urunler/yatay-su-depolari",
        permanent: true,
      },
      {
        source: "/hidrofor",
        destination: "/urunler/hidrofor",
        permanent: true,
      },
      {
        source: "/pompa",
        destination: "/urunler/pompa",
        permanent: true,
      },
      {
        source: "/suaritma",
        destination: "/hizmetler/su-aritma",
        permanent: true,
      },
      {
        source: "/hizmetlerimiz",
        destination: "/hizmetler",
        permanent: true,
      },
      {
        source: "/projelerimiz",
        destination: "/projeler",
        permanent: true,
      },
      {
        source: "/iletisim",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/hakkimizda",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/suisiticilari",
        destination: "/urunler/su-isiticilari",
        permanent: true,
      },
      // SEO 404 Fixes (28 Ekim 2025)
      {
        source: "/hizmetler/hidrofor",
        destination: "/hizmetler/hidrofor-sistemleri",
        permanent: true,
      },
      {
        source: "/urunler/varmeks-isi-pompasi-12-kw",
        destination: "/urunler/varmeks-varm-boost-11kw-isi-pompasi",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
