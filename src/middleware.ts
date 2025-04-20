import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import authConfig from "@/auth.config"
import {
  DEFAULT_LOGIN_REDIRECT,
  apiRoutes,
  authRoutes,
  publicRoutes,
} from "@/routes"

const { auth } = NextAuth(authConfig)

// Caching the URL constructor for better performance
const createUrl = (path: string, url: URL) => new URL(path, url)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Early return for API routes
  if (nextUrl.pathname.startsWith(apiRoutes)) {
    return NextResponse.next()
  }

  // Using Set.has() for O(1) lookup
  const isPublicRoute = publicRoutes.has(nextUrl.pathname)
  const isAuthRoute = authRoutes.has(nextUrl.pathname)

  if (isAuthRoute) {
    if (isLoggedIn) {
      // Reuse URL creation
      return Response.redirect(createUrl(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = nextUrl.search
      ? `${nextUrl.pathname}${nextUrl.search}`
      : nextUrl.pathname

    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return Response.redirect(
      createUrl(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    )
  }

  return NextResponse.next()
})

// Optimized matcher pattern
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets/ (local assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images/|assets/).*)",
  ],
}
