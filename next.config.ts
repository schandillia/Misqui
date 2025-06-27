import type { NextConfig } from "next"

// Import the bundle analyzer
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

const nextConfig: NextConfig = {
  // Optimize for Lambda@Edge and Vercel deployment
  output: "standalone", // Compatible with both Lambda@Edge and Vercel
  // Enable Edge runtime for App Router routes (set per-route for control)
  experimental: {
    // Global Edge runtime is experimental; prefer per-route config
    // runtime: "edge",
  },
  // Image optimization (temporary wildcard until S3/Vercel storage setup)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME!, // Specific CloudFront domain
        // If deploying on Vercel, replace with Vercel (e.g., *.vercel.app) domains
      },
    ],
  },
  // Enforce TypeScript type safety
  typescript: {
    ignoreBuildErrors: false,
  },
  // Define environment variables for build and Edge runtime
  env: {
    // Client-side variable
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "",
    // Server-side variables for Edge runtime (set in Lambda or Vercel config)
    AUTH_SECRET: process.env.AUTH_SECRET || "",
    AUTH_URL: process.env.AUTH_URL || "",
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID || "",
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET || "",
    STRIPE_API_KEY: process.env.STRIPE_API_KEY || "",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  },
}

// Only use bundle analyzer in production builds or when ANALYZE is true
export default process.env.NODE_ENV === "production" ||
process.env.ANALYZE === "true"
  ? withBundleAnalyzer(nextConfig)
  : nextConfig
