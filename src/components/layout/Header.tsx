"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { ShoppingCart, LogOut, Menu } from "lucide-react";

export function Header() {
  const { user, isLoggedIn, logout, checkAuth } = useAuthStore();
  const { totalQuantity } = useCartStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    checkAuth();
    setIsHydrated(true);
  }, [checkAuth]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      console.error("Logout failed");
    }
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Store
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex gap-6">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 cursor-pointer focus:text-gray-900"
          >
            Товари
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-900 focus:text-gray-900 cursor-pointer"
            >
              Адмін
            </Link>
          )}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative text-gray-600 hover:text-gray-900"
          >
            <ShoppingCart size={24} />
            {totalQuantity > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalQuantity}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isLoggedIn && user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{user.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut size={18} />
                Вихід
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Вхід
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Реєстрація</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
