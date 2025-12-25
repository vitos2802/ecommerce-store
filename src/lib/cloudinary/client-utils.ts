/**
 * ✅ Безпечно для клієнта
 * Без fs, без cloudinary SDK
 */

export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale";
    quality?: "auto" | number;
    format?: "auto" | "webp" | "jpg";
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
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
}

export function extractPublicId(url: string): string | null {
  if (!url) return null;
  const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function isCloudinaryUrl(url: string): boolean {
  return url.includes("cloudinary.com");
}
