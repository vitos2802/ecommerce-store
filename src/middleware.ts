import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;

    // Просто перевіряємо, чи токен існує
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Детальну верифікацію робимо на Client Component
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
