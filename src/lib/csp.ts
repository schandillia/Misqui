import app from "@/lib/data/app.json"

export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://${app.CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME}`,
  "font-src 'self'",
  "connect-src 'self' https://api.stripe.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ")
