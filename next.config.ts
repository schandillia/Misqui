import type { NextConfig } from "next"

// Import the bundle analyzer
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

const nextConfig: NextConfig = {
  /* config options here */
}

// Only use bundle analyzer in production builds, not with Turbopack dev server
export default process.env.NODE_ENV === "production" ||
process.env.ANALYZE === "true"
  ? withBundleAnalyzer(nextConfig)
  : nextConfig
