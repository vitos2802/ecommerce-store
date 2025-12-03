"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoggedIn, checkAuth, isLoading } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    checkAuth();
    setIsHydrated(true);
  }, [checkAuth]);

  if (!isHydrated || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Завантаження...</p>
      </div>
    );
  }

  if (!isLoggedIn || user?.role !== "admin") {
    router.push("/");
    return null;
  }

  return <>{children}</>;
}
