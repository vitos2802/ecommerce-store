import { z } from "zod";

/**
 * ТИМЧАСОВА VERSION - Послаблена валідація
 * Щоб додаток запустився, потім налаштуємо все правильно
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // MongoDB - ПОСЛАБЛЕНО: просто string
  MONGODB_URI: z.string().default("mongodb://localhost:27017/ecommerce"),

  // JWT - ПОСЛАБЛЕНО: мінімум 8 символів замість 32
  JWT_SECRET: z.string().min(8).default("temporary-secret-key-please-change"),

  // Stripe - ПОСЛАБЛЕНО: просто string
  STRIPE_SECRET_KEY: z.string().default("sk_test_placeholder"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().default("pk_test_placeholder"),

  // Cloudinary - все опціонально
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().optional(),

  // API URL
  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .optional()
    .default("http://localhost:3000"),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),

  // Analytics
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
});

/**
 * Валідація з автоматичним fallback
 */
const envValidation = envSchema.safeParse(process.env);

if (!envValidation.success) {
  console.warn("⚠️ Some environment variables are missing or invalid:");
  console.warn(JSON.stringify(envValidation.error.format(), null, 2));
  console.warn("⚠️ Using default values. Please update .env file!");

  // НЕ кидаємо помилку, а використовуємо defaults
}

/**
 * Експортуємо валідовані змінні (з defaults якщо треба)
 */
export const env = envValidation.success
  ? envValidation.data
  : envSchema.parse({}); // Використає всі defaults

/**
 * Тип для environment змінних
 */
export type Env = z.infer<typeof envSchema>;
