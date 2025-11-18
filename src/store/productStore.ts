import { create } from "zustand";
import apiClient from "@/lib/axios";
import { Product, PaginationData } from "@/types";

interface ProductState {
  products: Product[];
  pagination: PaginationData;
  category: string | null;
  isLoading: boolean;
  error: string | null;
  fetchProducts: (page?: number, category?: string) => Promise<void>;
  setCategory: (category: string | null) => void;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
  category: null,
  isLoading: false,
  error: null,

  fetchProducts: async (page = 1, category) => {
    set({ isLoading: true, error: null });
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (category) {
        params.category = category;
      }

      const response = await apiClient.get("/api/products", { params });

      set({
        products: response.data.products,
        pagination: response.data.pagination,
        category: category || null,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Не вдалося завантажити товари";
      set({ error: message, isLoading: false });
    }
  },

  setCategory: (category) => {
    set({ category });
  },

  clearError: () => {
    set({ error: null });
  },
}));
