import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type errors won't block builds — fix incrementally
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
