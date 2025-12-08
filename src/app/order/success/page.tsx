"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function OrderSuccessPage() {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <CheckCircle size={64} className="mx-auto mb-4 text-green-600" />
      <h1 className="text-3xl font-bold mb-2">Замовлення успішне!</h1>
      <p className="text-gray-600 mb-6">Дякуємо за покупку</p>
      <Link href="/">
        <Button>Повернутися до магазину</Button>
      </Link>
    </div>
  );
}
