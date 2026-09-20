import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // PROD_DIST_DIR builds to an isolated directory (used by the Playwright
  // webServer) so production builds never clobber a concurrently running
  // dev server's default .next/. No effect when unset.
  ...(process.env.PROD_DIST_DIR ? { distDir: process.env.PROD_DIST_DIR } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
