"use client";

import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ checkAuth викликається ОДИН РАЗ при mount
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/api/auth/me");
      setUser(response.data.user);
    } catch {
      // Якщо 401 - користувач не авторизований, це OK
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Автоматично при mount компонента
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    console.log("AuthProvider - user changed:", user); // DEBUG
  }, [user]);

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/api/auth/register", {
        email,
        password,
        name,
      });
      setUser(response.data.user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });
      setUser(response.data.user);
      console.log("User after login:", response.data.user); // DEBUG
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post("/api/auth/logout");
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isLoggedIn: !!user,
    isLoading,
    error,
    register,
    login,
    logout,
    checkAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ✅ Hook для використання в компонентах
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
