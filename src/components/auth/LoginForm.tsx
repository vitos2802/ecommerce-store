"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
// import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  // const { login, isLoading } = useAuthStore();
  const { login, isLoading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      console.log("User logged in, redirecting...", user); // DEBUG
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      toast.success("Ви успішно увійшли!");
      // router.push("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не вдалося увійти";
      toast.error(message);
    }
  };

  // Якщо вже залогінений - показуємо loader
  if (user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Вхід</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-3">
              Електронна пошта
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="password" className="mb-3">
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Вхід..." : "Увійти"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Немаєте облікового запису?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Зареєструйтеся
          </Link>
        </div>
      </div>
    </div>
  );
}
