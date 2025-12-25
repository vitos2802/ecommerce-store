"use client";

import Link from "next/link";
import { CldImage } from "next-cloudinary";
import Image from "next/image";
import { Product } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
// ✅ ВИПРАВЛЕНО: Імпортуємо з client-utils замість config!
import {
  extractPublicId,
  isCloudinaryUrl,
} from "@/lib/cloudinary/client-utils";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const isOutOfStock = product.stock === 0;

  // Перевіряємо чи це Cloudinary URL
  const isCloudinary = isCloudinaryUrl(product.image);
  const publicId = isCloudinary ? extractPublicId(product.image) : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

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

  return (
    <Link href={`/products/${product._id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative w-full h-48 bg-gray-100">
            {publicId ? (
              // Cloudinary зображення з оптимізацією
              <CldImage
                priority={index < 3}
                src={publicId}
                alt={product.name}
                width={400}
                height={300}
                crop="fill"
                gravity="auto"
                quality="auto"
                format="auto"
                className="object-cover w-full h-full"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              // Fallback для non-Cloudinary URLs
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={300}
                className="object-cover w-full h-full"
              />
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold">Немає в наявності</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
              {product.name}
            </h3>

            <p className="text-gray-600 text-sm mb-3 line-clamp-1">
              {product.description}
            </p>

            {/* Price and Stock */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-blue-600">
                ₴{product.price}
              </span>
              <span className="text-xs text-gray-500">
                Залишок: {product.stock}
              </span>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full flex items-center justify-center gap-2"
              variant={isOutOfStock ? "secondary" : "default"}
            >
              <ShoppingCart size={18} />
              {isOutOfStock ? "Немає в наявності" : "Додати в кошик"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
