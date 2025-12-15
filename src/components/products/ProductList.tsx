"use client";

import { useEffect, useState } from "react";
import { useProductStore } from "@/store/productStore";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = ["Electronics", "Clothing", "Books", "Home", "Other"];

export function ProductList() {
  const { products, pagination, isLoading, error, fetchProducts } =
    useProductStore();

  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Завантажити товари при монтуванні або змінах
  useEffect(() => {
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!)
      : 1;
    const cat = searchParams.get("category") || null;

    setSelectedCategory(cat);
    fetchProducts(page, cat || undefined);
  }, [searchParams, fetchProducts]);

  const handleCategoryChange = (cat: string | null) => {
    setSelectedCategory(cat);
    // setCategory(cat);
    fetchProducts(1, cat || undefined);
  };

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      fetchProducts(pagination.page - 1, selectedCategory || undefined);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.pages) {
      fetchProducts(pagination.page + 1, selectedCategory || undefined);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Категорія
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
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
        <div className="text-center py-12">
          <p className="text-gray-600">Завантаження товарів...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Товарів не знайдено</p>
        </div>
      ) : (
        <>
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 py-8">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={pagination.page === 1 || isLoading}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Попередня
            </Button>

            <span className="text-sm text-gray-600">
              Сторінка {pagination.page} з {pagination.pages}
            </span>

            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={pagination.page === pagination.pages || isLoading}
              className="flex items-center gap-2"
            >
              Наступна
              <ChevronRight size={18} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
