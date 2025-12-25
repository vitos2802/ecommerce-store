"use client";

import { useState, useRef } from "react";
import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/axios";

interface ImageUploaderProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  currentImageUrl?: string;
  folder?: string;
  maxSizeMB?: number;
}

export function ImageUploader({
  onUploadSuccess,
  currentImageUrl,
  folder = "products",
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Перевірка типу файлу
    if (!file.type.startsWith("image/")) {
      toast.error("Будь ласка, виберіть зображення");
      return;
    }

    // Перевірка розміру
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      toast.error(`Розмір файлу не повинен перевищувати ${maxSizeMB}MB`);
      return;
    }

    // Конвертація в base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setPreview(base64String);

      // Upload
      await uploadImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (base64Data: string) => {
    setIsUploading(true);
    try {
      const response = await apiClient.post("/api/upload/image", {
        image: base64Data,
        folder,
      });

      const { url, publicId } = response.data.data;

      toast.success("Зображення успішно завантажено!");
      onUploadSuccess(url, publicId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Помилка завантаження";
      toast.error(message);
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <Label>Зображення товару</Label>

      {preview ? (
        <div className="relative w-full h-64 border-2 border-gray-200 rounded-lg overflow-hidden">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized={preview.startsWith("data:")}
          />

          {!isUploading && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
              type="button"
            >
              <X size={16} />
            </button>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white flex flex-col items-center gap-2">
                <Loader2 size={32} className="animate-spin" />
                <p>Завантаження...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload size={48} className="text-gray-400" />
            <p className="text-gray-600">
              Клікніть для вибору або перетягніть зображення
            </p>
            <p className="text-sm text-gray-400">
              PNG, JPG, WEBP до {maxSizeMB}MB
            </p>
          </label>
        </div>
      )}
    </div>
  );
}
