import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  DEFAULT_LOGIN_REDIRECT,
  apiRoutes,
  authRoutes,
  publicRoutes,
} from "@/routes"
import { logger } from "@/lib/logger"

// Define session type to match AuthJS v5 structure
interface Session {
  user?: {
    id?: string
    role?: string
  }
}

// Cached URL constructor for performance
const createUrl = (path: string, url: URL) => new URL(path, url)

export async function middleware(req: NextRequest) {
  const { nextUrl } = req
  const session = await auth() // Get session from AuthJS
  const isLoggedIn = !!session
  const isAdmin = session?.user?.role === "admin"

  // Initialize response
  const response = NextResponse.next()

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // CSP Configuration
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://api.stripe.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ]
  response.headers.set("Content-Security-Policy", csp.join("; "))

  // Early return for API routes
  if (nextUrl.pathname.startsWith(apiRoutes)) {
    return response
  }

  // O(1) lookup for route checks
  const isPublicRoute = publicRoutes.has(nextUrl.pathname)
  const isAuthRoute = authRoutes.has(nextUrl.pathname)

  // Handle admin routes
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search)
      logger.warn(
        "Unauthorized access attempt to admin route (not logged in)",
        {
          path: nextUrl.pathname,
          timestamp: new Date().toISOString(),
          module: "middleware",
        }
      )
      return NextResponse.redirect(
        createUrl(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl)
      )
    }
    if (!isAdmin) {
      logger.warn("Unauthorized access attempt to admin route (not admin)", {
        userId: session?.user?.id,
        path: nextUrl.pathname,
        timestamp: new Date().toISOString(),
        module: "middleware",
      })
      return NextResponse.redirect(createUrl("/unauthorized", nextUrl))
    }
    return response
  }

  // Handle auth routes
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(createUrl(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return response
  }

  // Redirect unauthenticated users to login for protected routes
  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = nextUrl.search
      ? `${nextUrl.pathname}${nextUrl.search}`
      : nextUrl.pathname
    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return NextResponse.redirect(
      createUrl(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    )
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
}
