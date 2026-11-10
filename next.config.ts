import type { NextConfig } from "next";

/*
 * GitHub Pages yayın yolu. Proje sitesi olarak yayınlanınca "/gul-tekin-neon-app",
 * özel domain bağlanınca "" olur. Workflow'da actions/configure-pages çıktısından gelir;
 * yerelde boş bırakılırsa site kökten çalışır.
 */
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  /* SEO and Performance Optimizations */
  poweredByHeader: false,

  /* Static Export for GitHub Pages */
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    // İstemci tarafında ham "/..." görsel yollarına önek eklemek için (lib/base-path.ts)
    NEXT_PUBLIC_BASE_PATH: basePath,
  },

  /* Build Performance */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  /* Experimental Performance Features */
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },

  /* Image Optimization — unoptimized: required for static export, Cloudinary zaten optimize ediyor */
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
};

export default nextConfig;
