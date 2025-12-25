import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";

// Конфігурація для server-side
if (typeof window === "undefined") {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export default cloudinary;

// Утиліти для роботи з URL
export const cloudinaryConfig = {
  cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
};

/**
 * Генерує оптимізований URL для зображення
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "thumb";
    quality?: "auto" | number;
    format?: "auto" | "webp" | "jpg" | "png";
  }
): string {
  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto",
  } = options || {};

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`c_${crop}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  const transformString = transformations.join(",");

  return `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
}

/**
 * Витягує public_id з Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
