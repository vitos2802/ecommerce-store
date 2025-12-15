import { NextRequest, NextResponse } from "next/server";
import { verifyToken, TokenPayload } from "./jwt";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";

/**
 * API Middleware для верифікації користувача
 * Використовується для захисту API роутів
 */
export async function withAuth(
  request: NextRequest,
  handler: (
    request: NextRequest,
    context: { user: TokenPayload }
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Отримуємо токен з кукі
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }

    // Верифікуємо токен
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token. Please log in again." },
        { status: 401 }
      );
    }

    // Підключаємось до БД
    await connectDB();

    // Перевіряємо, чи користувач все ще існує
    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please log in again." },
        { status: 401 }
      );
    }

    // Оновлюємо payload з актуальною роллю з БД
    const updatedPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // Викликаємо handler з даними користувача
    return await handler(request, { user: updatedPayload });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * API Middleware для верифікації адміністратора
 * Використовується для захисту admin API роутів
 */
export async function withAdmin(
  request: NextRequest,
  handler: (
    request: NextRequest,
    context: { user: TokenPayload }
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (request, context) => {
    // Перевіряємо роль
    if (context.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    // Викликаємо handler
    return await handler(request, context);
  });
}

/**
 * Опціональна аутентифікація
 * Якщо токен є - додає user в context, якщо ні - user буде null
 */
export async function withOptionalAuth(
  request: NextRequest,
  handler: (
    request: NextRequest,
    context: { user: TokenPayload | null }
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return await handler(request, { user: null });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return await handler(request, { user: null });
    }

    await connectDB();
    const user = await User.findById(payload.userId);

    if (!user) {
      return await handler(request, { user: null });
    }

    const updatedPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return await handler(request, { user: updatedPayload });
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    return await handler(request, { user: null });
  }
}
