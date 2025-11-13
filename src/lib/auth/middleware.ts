import { NextRequest } from "next/server";
import { verifyToken, TokenPayload } from "./jwt";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";

/**
 * Верифікує користувача з токену в кукі
 * Повертає дані користувача або null
 */
export async function verifyUser(
  request: NextRequest
): Promise<{ userId: string; email: string; role: string } | null> {
  try {
    // Отримуємо токен з кукі
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    // Верифікуємо токен
    const payload: TokenPayload | null = verifyToken(token);

    if (!payload) {
      return null;
    }

    // Підключаємось до БД
    await connectDB();

    // Перевіряємо, чи користувач все ще існує
    const user = await User.findById(payload.userId);

    if (!user) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}

interface VerifyUserResponse {
  userId: string;
  email: string;
  role: string;
}

/**
 * Верифікує, чи користувач — admin
 * Кидає помилку, якщо користувач не admin або не автентифікований
 */
export function verifyAdmin(
  userData: VerifyUserResponse | null
): VerifyUserResponse {
  if (!userData) {
    throw new Error("Unauthorized");
  }

  if (userData.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return userData;
}
