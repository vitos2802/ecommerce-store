"use client";

import { useRouter } from "next/navigation";
import { useAllProducts, useDeleteProduct } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Edit, Plus, Loader2 } from "lucide-react";

export default function AdminProductsPage() {
  const router = useRouter();

  // ✅ TanStack Query - завантаження всіх товарів
  const { data: products, isLoading, error } = useAllProducts();

  // ✅ TanStack Query - видалення товару
  const deleteProduct = useDeleteProduct();

  const handleDelete = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей товар?")) {
      return;
    }

    try {
      await deleteProduct.mutateAsync(id);
      // Toast вже показаний в useDeleteProduct hook
      // Кеш автоматично оновлено!
    } catch (error) {
      // Помилка вже оброблена в useDeleteProduct hook
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/products/${id}/edit`);
  };

  const handleCreate = () => {
    router.push("/admin/products/new");
  };

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-red-600">
          Помилка завантаження товарів
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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

      <div className="rounded-lg border overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Назва</TableHead>
              <TableHead>Категорія</TableHead>
              <TableHead>Ціна</TableHead>
              <TableHead>Залишок</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!products || products.length === 0 ? (
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
                  <TableCell>₴{product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        product.stock === 0
                          ? "bg-red-100 text-red-700"
                          : product.stock < 10
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {product.stock} шт
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
                        disabled={deleteProduct.isPending}
                        className="gap-1"
                      >
                        {deleteProduct.isPending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        Видалити
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Статистика */}
      {products && products.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Всього товарів</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Товарів в наявності</p>
            <p className="text-2xl font-bold text-green-600">
              {products.filter((p) => p.stock > 0).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Немає в наявності</p>
            <p className="text-2xl font-bold text-red-600">
              {products.filter((p) => p.stock === 0).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
