"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Product } from "@/types";
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
import { toast } from "sonner";
import apiClient from "@/lib/axios";
import { ArrowLeft } from "lucide-react";

const CATEGORIES = ["Electronics", "Clothing", "Books", "Home", "Other"];

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const [productId, setProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    stock: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Отримати productId з params
  // useEffect(() => {
  //   params.then(({ id }) => {
  //     setProductId(id);
  //   });
  // }, [params]);

  // Завантажити товар
  useEffect(() => {
    params.then(({ id }) => {
      setProductId(id);
    });

    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<{
          success: boolean;
          product: Product;
        }>(`/api/products/${productId}`);

        const product = response.data.product;
        setFormData({
          name: product.name,
          price: product.price.toString(),
          description: product.description,
          image: product.image,
          stock: product.stock.toString(),
          category: product.category,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Помилка при завантаженні товару";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, params]);

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
    if (!formData.image.trim()) {
      toast.error("Введіть URL зображення");
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

    if (!validateForm() || !productId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.patch(`/api/products/${productId}`, {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        image: formData.image,
        stock: parseInt(formData.stock, 10),
        category: formData.category,
      });

      toast.success("Товар успішно оновлено");
      router.push("/admin/products");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Помилка при оновленні товару";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Завантаження товара...</p>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold mb-6">Редагувати товар</h1>

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

          {/* Image URL */}
          <div>
            <Label htmlFor="image">URL зображення</Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              disabled={isSubmitting}
            />
          </div>

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
            <Label htmlFor="category">Категорія</Label>
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
            {isSubmitting ? "Оновлення..." : "Оновити товар"}
          </Button>
        </form>
      </div>
    </div>
  );
}
