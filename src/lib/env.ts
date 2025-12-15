import { z } from "zod";

/**
 * Схема валідації для environment змінних
 * Всі змінні перевіряються під час запуску додатку
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // MongoDB
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .startsWith(
      "mongodb",
      "MONGODB_URI must be a valid MongoDB connection string"
    ),

  // JWT
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters for security")
    .describe("Secret key for signing JWT tokens"),

  // Stripe
  STRIPE_SECRET_KEY: z
    .string()
    .min(1, "STRIPE_SECRET_KEY is required")
    .startsWith("sk_", "STRIPE_SECRET_KEY must start with sk_"),

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required")
    .startsWith(
      "pk_",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_"
    ),

  // API URL (optional, defaults to localhost in dev)
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL")
    .optional()
    .default("http://localhost:3000"),

  // Optional: Base URL для production
  NEXT_PUBLIC_BASE_URL: z
    .string()
    .url("NEXT_PUBLIC_BASE_URL must be a valid URL")
    .optional(),

  // Optional: Analytics, Sentry тощо
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
});

/**
 * Валідація і парсинг environment змінних
 * Якщо щось не так - додаток не запуститься з чіткою помилкою
 */
const envValidation = envSchema.safeParse(process.env);

if (!envValidation.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(envValidation.error.format(), null, 2));
  throw new Error("Invalid environment variables");
}

/**
 * Експортуємо валідовані змінні
 * Тепер вони типізовані і гарантовано існують!
 */
export const env = envValidation.data;

/**
 * Тип для environment змінних (для використання в інших файлах)
 */
export type Env = z.infer<typeof envSchema>;
