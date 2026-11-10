import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* SEO and Performance Optimizations */
  poweredByHeader: false,

  /* Static Export for GitHub Pages */
  output: 'export',

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
