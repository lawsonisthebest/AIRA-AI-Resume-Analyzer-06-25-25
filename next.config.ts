import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add Clerk-specific configuration
  transpilePackages: ["@clerk/nextjs"],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    // next.config.js
    module.exports = {
      eslint: {
        ignoreDuringBuilds: true,
      },
    };

    return config;
  },
};

export default nextConfig;
