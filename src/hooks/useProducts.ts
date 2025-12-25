import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { Product } from "@/types";
import { toast } from "sonner";
import { AxiosError } from "axios";

// ================================
// Query Keys
// ================================
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters?: ProductFilters) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// ================================
// Types
// ================================
interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    pages: number;
    total: number;
  };
}

// ================================
// GET: Отримання списку товарів (з фільтрами)
// ================================
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.category) params.append("category", filters.category);

      const response = await apiClient.get<ProductsResponse>(
        `/api/products?${params.toString()}`
      );
      return response.data;
    },
  });
}

// ================================
// GET: Отримання всіх товарів (без пагінації)
// ================================
export function useAllProducts() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get<{ products: Product[] }>(
        "/api/products?all=true"
      );
      return response.data.products;
    },
  });
}

// ================================
// GET: Отримання одного товару
// ================================
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<{ product: Product }>(
        `/api/products/${id}`
      );
      return response.data.product;
    },
    enabled: !!id,
  });
}

// ================================
// POST: Створення товару
// ================================
interface CreateProductData {
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  category: string;
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductData) => {
      const response = await apiClient.post("/api/products", data);
      return response.data;
    },
    onSuccess: () => {
      // Інвалідуємо всі списки товарів
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Товар успішно створено!");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      const message = error.response?.data?.error || "Помилка створення товару";
      toast.error(message);
    },
  });
}

// ================================
// PATCH: Оновлення товару
// ================================
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateProductData>;
    }) => {
      const response = await apiClient.patch(`/api/products/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Інвалідуємо кеш
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Товар успішно оновлено!");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      const message = error.response?.data?.error || "Помилка оновлення товару";
      toast.error(message);
    },
  });
}

// ================================
// DELETE: Видалення товару
// ================================
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Товар успішно видалено!");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      const message = error.response?.data?.error || "Помилка видалення товару";
      toast.error(message);
    },
  });
}

// ================================
// Prefetch (завантаження заздалегідь)
// ================================
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(id),
      queryFn: async () => {
        const response = await apiClient.get<{ product: Product }>(
          `/api/products/${id}`
        );
        return response.data.product;
      },
    });
  };
}
