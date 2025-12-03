import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Адмін Панель</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/products">
          <Button className="w-full h-24 text-lg">
            📦 Управління товарами
          </Button>
        </Link>

        <Link href="/admin/orders">
          <Button className="w-full h-24 text-lg" disabled>
            📋 Замовлення (скоро)
          </Button>
        </Link>
      </div>
    </div>
  );
}
