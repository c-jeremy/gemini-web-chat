import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle secret auth route
  if (pathname === "/cjeremy") {
    const response = NextResponse.redirect(new URL("/", request.url))
    // Set secure HTTP-only cookie for 30 days
    response.cookies.set("auth-token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })
    return response
  }

  // Check authentication for main routes
  if (pathname === "/" || pathname.startsWith("/api/chat")) {
    const authToken = request.cookies.get("auth-token")

    if (!authToken || authToken.value !== "authenticated") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/api/chat/:path*", "/cjeremy"],
}
