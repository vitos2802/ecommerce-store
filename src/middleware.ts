import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function middleware(request: NextRequest) {
  // Логування тільки в development
  if (env.NODE_ENV === "development") {
    console.log(`[Middleware] ${request.method} ${request.url}`);
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
