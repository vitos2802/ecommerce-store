"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { toast } from "sonner";
import apiClient from "@/lib/axios";
import { ArrowLeft } from "lucide-react";

const CATEGORIES = ["Electronics", "Clothing", "Books", "Home", "Other"];

export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    imagePublicId: "",
    stock: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (url: string, publicId: string) => {
    setFormData((prev) => ({
      ...prev,
      image: url,
      imagePublicId: publicId,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Введіть назву товара");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Введіть коректну ціну");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Введіть опис товара");
      return false;
    }
    if (!formData.image) {
      toast.error("Додайте зображення товару");
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error("Введіть коректний залишок");
      return false;
    }
    if (!formData.category) {
      toast.error("Виберіть категорію");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/api/products", {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        image: formData.image,
        stock: parseInt(formData.stock, 10),
        category: formData.category,
      });

      toast.success("Товар успішно доданий");
      router.push("/admin/products");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Помилка при додаванні товару";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Link */}
      <Link
        href="/admin/products"
        className="inline-flex items-center mb-6 text-blue-600 hover:underline"
      >
        <ArrowLeft size={18} className="mr-2" />
        Повернутися до списку
      </Link>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Додати новий товар</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Назва товара</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Введіть назву товара"
              disabled={isSubmitting}
            />
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price">Ціна (₴)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              placeholder="Введіть ціну"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Опис</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Введіть опис товара"
              disabled={isSubmitting}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Uploader */}
          <ImageUploader
            onUploadSuccess={handleImageUpload}
            folder="products"
            maxSizeMB={5}
          />

          {/* Stock */}
          <div>
            <Label htmlFor="stock">Залишок (шт.)</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Введіть кількість"
              disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div>
            <Label>Категорія</Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger disabled={isSubmitting}>
                <SelectValue placeholder="Виберіть категорію" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Додавання..." : "Додати товар"}
          </Button>
        </form>
      </div>
    </div>
  );
}
