"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/store/productStore";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/axios";

export default function AdminProductsPage() {
  const router = useRouter();
  const { products, pagination, isLoading, fetchProducts } = useProductStore();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadProducts = async () => {
      await useProductStore.getState().fetchProducts(currentPage);
    };
    loadProducts();
  }, [currentPage]);

  const handleDelete = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей товар?")) {
      return;
    }

    try {
      await apiClient.delete(`/api/products/${id}`);
      toast.success("Товар успішно видалений");
      fetchProducts(currentPage);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Помилка при видаленні товару";
      toast.error(message);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/products/${id}/edit`);
  };

  const handleCreate = () => {
    router.push("/admin/products/new");
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Завантаження...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Управління товарами</h1>
        <Button onClick={handleCreate} className="gap-2">
          <Plus size={18} />
          Додати товар
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Назва</TableHead>
              <TableHead>Категорія</TableHead>
              <TableHead>Ціна</TableHead>
              <TableHead>Залишок</TableHead>
              <TableHead>Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Товарів не знайдено
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>₴{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product._id)}
                      className="gap-1"
                    >
                      <Edit size={16} />
                      Редагувати
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product._id)}
                      className="gap-1"
                    >
                      <Trash2 size={16} />
                      Видалити
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Пагінація */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            variant="outline"
          >
            Попередня
          </Button>
          <div className="flex items-center gap-2">
            <span>
              Сторінка {currentPage} з {pagination.pages}
            </span>
          </div>
          <Button
            onClick={() =>
              setCurrentPage((p) => Math.min(pagination.pages, p + 1))
            }
            disabled={currentPage === pagination.pages}
            variant="outline"
          >
            Наступна
          </Button>
        </div>
      )}
    </div>
  );
}
