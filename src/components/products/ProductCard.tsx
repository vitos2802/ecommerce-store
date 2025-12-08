"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const isOutOfStock = product.stock === 0;

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
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
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

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
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
