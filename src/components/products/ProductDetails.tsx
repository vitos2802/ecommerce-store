"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types";
import apiClient from "@/lib/axios";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface ProductDetailsProps {
  productId: string;
}

export function ProductDetails({ productId }: ProductDetailsProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get<{
          success: boolean;
          product: Product;
        }>(`/api/products/${productId}`);
        setProduct(response.data.product);
      } catch {
        setError("Не вдалося завантажити інформацію про товар");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const isOutOfStock = product?.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!product) return;

    if (isOutOfStock) {
      toast.error("Товар закінчився");
      return;
    }

    addToCart({
      ...product,
      quantity: 1,
    });

    toast.success(`${product.name} додано до кошика!`);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center py-12">
        <p className="text-gray-600">Завантаження товара...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Link
          href="/"
          className="inline-flex items-center mb-4 text-blue-600 hover:underline"
        >
          <ArrowLeft size={18} className="mr-2" />
          Повернутися до каталогу
        </Link>
        <div className="text-center py-12">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Link
          href="/"
          className="inline-flex items-center mb-4 text-blue-600 hover:underline"
        >
          <ArrowLeft size={18} className="mr-2" />
          Повернутися до каталогу
        </Link>
        <div className="text-center py-12">
          <p className="text-gray-600">Товар не знайдено</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center mb-8 text-blue-600 hover:underline"
      >
        <ArrowLeft size={18} className="mr-2" />
        Повернутися до каталогу
      </Link>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                Немає в наявності
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-blue-600">
              ₴{product.price}
            </span>
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
              {product.category}
            </span>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Stock Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Залишок:{" "}
              <span
                className={
                  isOutOfStock
                    ? "text-red-600 font-bold"
                    : "text-green-600 font-bold"
                }
              >
                {isOutOfStock ? "Немає" : `${product.stock} шт.`}
              </span>
            </p>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            size="lg"
            className="w-full flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            {isOutOfStock ? "Немає в наявності" : "Додати до кошика"}
          </Button>
        </div>
      </div>
    </div>
  );
}
