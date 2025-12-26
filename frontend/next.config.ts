import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Disable static generation to avoid context issues during build
  // output: 'standalone',
};

export default nextConfig;
