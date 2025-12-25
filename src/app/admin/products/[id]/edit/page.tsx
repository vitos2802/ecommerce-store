"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
import { useProduct, useUpdateProduct } from "@/hooks/useProducts";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const CATEGORIES = ["Electronics", "Clothing", "Books", "Home", "Other"];

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const [productId, setProductId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    imagePublicId: "",
    stock: "",
    category: "",
  });

  // Отримати ID з params
  useEffect(() => {
    params.then(({ id }) => setProductId(id));
  }, [params]);

  // ✅ TanStack Query - завантаження товару
  const { data: product, isLoading } = useProduct(productId);

  // ✅ TanStack Query - оновлення товару
  const updateProduct = useUpdateProduct();

  // Заповнити форму даними товару
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        image: product.image,
        imagePublicId: "",
        stock: product.stock.toString(),
        category: product.category,
      });
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleImageUpload = (url: string, publicId: string) => {
    setFormData((prev) => ({ ...prev, image: url, imagePublicId: publicId }));
    toast.success("Зображення оновлено!");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Введіть назву товару");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Введіть коректну ціну");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Введіть опис товару");
      return false;
    }
    if (!formData.image.trim()) {
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

    if (!validateForm() || !productId) {
      return;
    }

    try {
      // ✅ Використовуємо mutation з TanStack Query
      await updateProduct.mutateAsync({
        id: productId,
        data: {
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          image: formData.image,
          stock: parseInt(formData.stock, 10),
          category: formData.category,
        },
      });

      // Toast вже показаний в useUpdateProduct hook
      router.push("/admin/products");
    } catch (error) {
      // Помилка вже оброблена в useUpdateProduct hook
      console.error("Update error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-red-600">Товар не знайдено</p>
        <Link href="/admin/products" className="text-blue-600 hover:underline">
          Повернутися до списку
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Поточне зображення */}
          <div>
            <Label>Поточне зображення</Label>
            <div className="mt-2 relative w-full h-64 border-2 border-gray-200 rounded-lg overflow-hidden">
              {formData.image ? (
                <Image
                  src={formData.image}
                  alt={formData.name || "Product"}
                  fill
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">Завантаження...</span>
                </div>
              )}
            </div>
          </div>

          {/* Завантаження нового зображення */}
          <div>
            <Label>Змінити зображення</Label>
            <p className="text-sm text-gray-500 mb-2">
              Завантажте нове зображення щоб замінити поточне
            </p>
            <ImageUploader
              onUploadSuccess={handleImageUpload}
              currentImageUrl={formData.image}
              folder="products"
              maxSizeMB={5}
            />
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Назва товару</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Введіть назву товару"
              disabled={updateProduct.isPending}
              required
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
              disabled={updateProduct.isPending}
              required
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
              placeholder="Введіть опис товару"
              disabled={updateProduct.isPending}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Категорія</Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
              disabled={updateProduct.isPending}
            >
              <SelectTrigger>
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
              disabled={updateProduct.isPending}
              required
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={updateProduct.isPending}
              className="flex-1"
              size="lg"
            >
              {updateProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Збереження...
                </>
              ) : (
                "Зберегти зміни"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
              disabled={updateProduct.isPending}
              size="lg"
            >
              Скасувати
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
