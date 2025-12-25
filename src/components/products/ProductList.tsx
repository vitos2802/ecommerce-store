"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const CATEGORIES = ["Electronics", "Clothing", "Books", "Home", "Other"];

export function ProductList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page")!)
    : 1;
  const category = searchParams.get("category") || undefined;

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    category
  );

  // ✅ TanStack Query з серверною пагінацією
  const { data, isLoading, error } = useProducts({
    page,
    limit: 12,
    category: selectedCategory,
  });

  const handleCategoryChange = (cat: string | null) => {
    setSelectedCategory(cat || undefined);

    // Оновити URL
    const params = new URLSearchParams();
    params.set("page", "1");
    if (cat) params.set("category", cat);

    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set("page", newPage.toString());
    if (selectedCategory) params.set("category", selectedCategory);

    router.push(`?${params.toString()}`);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">
          Помилка завантаження товарів
        </p>
      </div>
    );
  }

  const products = data?.products || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Категорія
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            onClick={() => handleCategoryChange(null)}
            size="sm"
          >
            Всі
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => handleCategoryChange(cat)}
              size="sm"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Товарів не знайдено</p>
        </div>
      ) : (
        <>
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 py-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || isLoading}
                className="flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                Попередня
              </Button>

              <span className="text-sm text-gray-600">
                Сторінка {pagination.page} з {pagination.pages}
                <span className="text-xs text-gray-400 ml-2">
                  ({pagination.total} товарів)
                </span>
              </span>

              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages || isLoading}
                className="flex items-center gap-2"
              >
                Наступна
                <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
