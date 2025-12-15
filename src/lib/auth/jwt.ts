import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

// const JWT_SECRET: string = process.env.JWT_SECRET!;

// if (!JWT_SECRET) {
//   throw new Error("Please define JWT_SECRET environment variable");
// }

export interface TokenPayload {
  userId: string;
  email: string;
  role: "user" | "admin";
}

/**
 * Генерує JWT токен
 */
export function generateToken(payload: TokenPayload, expiresIn = "7d"): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

/**
 * Верифікує JWT токен
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Декодує токен без верифікації (для отримання інформації)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload | null;
    return decoded;
  } catch {
    return null;
  }
}
