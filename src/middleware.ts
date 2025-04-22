import { NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  DEFAULT_LOGIN_REDIRECT,
  apiRoutes,
  authRoutes,
  publicRoutes,
} from "@/routes"

// Cached URL constructor for performance
const createUrl = (path: string, url: URL) => new URL(path, url)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Early return for API routes
  if (nextUrl.pathname.startsWith(apiRoutes)) {
    return NextResponse.next()
  }

  // O(1) lookup for route checks
  const isPublicRoute = publicRoutes.has(nextUrl.pathname)
  const isAuthRoute = authRoutes.has(nextUrl.pathname)

  // Handle auth routes
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(createUrl(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return NextResponse.next()
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

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - assets/ (local assets)
     * - Image/SVG files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
}
