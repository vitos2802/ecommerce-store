import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/apiMiddleware";
import { uploadBase64Image } from "@/lib/cloudinary/upload";

export const runtime = "nodejs";
export const maxDuration = 30; // 30 секунд для upload

export async function POST(request: NextRequest): Promise<NextResponse> {
  return withAuth(request, async (req, { user }) => {
    try {
      const body = await req.json();
      const { image, folder, tags } = body;

      // Валідація
      if (!image || typeof image !== "string") {
        return NextResponse.json(
          { error: "Image data is required" },
          { status: 400 }
        );
      }

      // Перевірка формату base64
      if (!image.startsWith("data:image/")) {
        return NextResponse.json(
          { error: "Invalid image format. Must be base64 data URL" },
          { status: 400 }
        );
      }

      // Upload to Cloudinary
      const result = await uploadBase64Image(image, {
        folder: folder || "products",
        tags: tags || ["product", `user:${user.userId}`],
      });

      // Логування
      console.log(`Image uploaded by ${user.email}: ${result.publicId}`);

      return NextResponse.json(
        {
          success: true,
          data: {
            publicId: result.publicId,
            url: result.secureUrl,
            width: result.width,
            height: result.height,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Upload error:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to upload image",
        },
        { status: 500 }
      );
    }
  });
}
