import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Do not fail the production build on ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Do not fail the production build on type errors
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://backend:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
