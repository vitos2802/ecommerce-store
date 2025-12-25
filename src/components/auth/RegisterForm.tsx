"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function RegisterForm() {
  const router = useRouter();
  // const { register, isLoading } = useAuthStore();
  const { register, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Пароль має бути не менше 6 символів");
      return;
    }

    try {
      await register(email, password, name);
      toast.success("Реєстрація успішна!");
      router.push("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не вдалося зареєструватися";
      toast.error(message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Реєстрація</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Ім&apos;я</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ваше ім'я"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="email">Електронна пошта</Label>
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
            <Label htmlFor="password">Пароль</Label>
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
            {isLoading ? "Реєстрація..." : "Зареєструватися"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Вже маєте обліковий запис?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Увійдіть
          </Link>
        </div>
      </div>
    </div>
  );
}
