import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Disable static generation for all pages
  output: 'standalone',
};

export default nextConfig;
