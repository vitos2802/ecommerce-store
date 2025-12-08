"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ArrowLeft, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, totalPrice, removeItem, updateItemQuantity } = useCartStore();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-12">
          <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400" />
          <h1 className="text-3xl font-bold mb-2">Кошик порожній</h1>
          <p className="text-gray-600 mb-6">Додайте товари до кошика</p>
          <Link href="/">
            <Button size="lg" className="gap-2">
              <ArrowLeft size={18} />
              Повернутися до товарів
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Кошик покупок</h1>

      {/* Таблиця товарів */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Товар
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ціна
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Кількість
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сума
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дія
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item._id}>
                  {/* Товар */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover rounded"
                        />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>

                  {/* Ціна */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    ₴{item.price.toFixed(2)}
                  </td>

                  {/* Кількість */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Input
                      type="number"
                      value={item.quantity}
                      min={1}
                      onChange={(e) => {
                        const newQty = parseInt(e.target.value);
                        if (newQty > 0) {
                          updateItemQuantity(item._id, newQty);
                        }
                      }}
                      className="w-20"
                    />
                  </td>

                  {/* Сума */}
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">
                    ₴{(item.price * item.quantity).toFixed(2)}
                  </td>

                  {/* Видалити */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(item._id)}
                      className="gap-2"
                    >
                      <Trash2 size={16} />
                      Видалити
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Сума і кнопки */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-bold">
            Загальна сума:{" "}
            <span className="text-blue-600">₴{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Link href="/">
            <Button variant="outline" size="lg" className="gap-2">
              <ArrowLeft size={18} />
              Продовжити покупки
            </Button>
          </Link>
          <Button size="lg" onClick={handleCheckout} className="gap-2">
            <ShoppingBag size={18} />
            Оформити замовлення
          </Button>
        </div>
      </div>
    </div>
  );
}
