import type { NextConfig } from "next";

const ngrokHost = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") ?? "";

const nextConfig: NextConfig = {
  allowedDevOrigins: ngrokHost ? [ngrokHost] : [],
  images: {
    remotePatterns: [
      { hostname: "avatars.githubusercontent.com" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", ngrokHost].filter(Boolean),
    },
  },
};

export default nextConfig;
