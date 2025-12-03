import { create } from "zustand";
import apiClient from "@/lib/axios";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("/api/auth/register", {
        email,
        password,
        name,
      });

      set({
        user: response.data.user,
        isLoggedIn: true,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });

      set({
        user: response.data.user,
        isLoggedIn: true,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post("/api/auth/logout");

      set({
        user: null,
        isLoggedIn: false,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Logout failed";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get("/api/auth/me");

      set({
        user: response.data.user,
        isLoggedIn: true,
        isLoading: false,
      });
    } catch {
      // Якщо 401 — користувач не авторизований, це OK
      set({
        user: null,
        isLoggedIn: false,
        isLoading: false,
      });
    }
  },
}));
