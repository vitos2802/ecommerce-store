
import cloudinary from "./config";
import { UploadApiResponse } from "cloudinary";

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
}

/**
 * Завантажує зображення з base64 string
 */
export async function uploadBase64Image(
  base64Data: string,
  options?: {
    folder?: string;
    publicId?: string;
    tags?: string[];
    transformation?: {
      width?: number;
      height?: number;
      crop?: string;
    };
  }
): Promise<UploadResult> {
  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(
      base64Data,
      {
        folder: options?.folder || "products",
        public_id: options?.publicId,
        tags: options?.tags || [],
        transformation: options?.transformation,
        resource_type: "auto",
      }
    );

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

/**
 * Завантажує зображення з URL
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  options?: {
    folder?: string;
    publicId?: string;
    tags?: string[];
  }
): Promise<UploadResult> {
  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(
      imageUrl,
      {
        folder: options?.folder || "products",
        public_id: options?.publicId,
        tags: options?.tags || [],
        resource_type: "auto",
      }
    );

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image from URL");
  }
}

/**
 * Видаляє зображення з Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
}

/**
 * Видаляє кілька зображень одночасно
 */
export async function deleteMultipleImages(
  publicIds: string[]
): Promise<{ deleted: string[]; failed: string[] }> {
  const deleted: string[] = [];
  const failed: string[] = [];

  await Promise.all(
    publicIds.map(async (publicId) => {
      const success = await deleteImage(publicId);
      if (success) {
        deleted.push(publicId);
      } else {
        failed.push(publicId);
      }
    })
  );

  return { deleted, failed };
}
