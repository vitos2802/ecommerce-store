"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import apiClient from "@/lib/axios";

export default function CheckoutPage() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  // Перевіряємо, чи кошик не порожній
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const response = await apiClient.post("/api/payments/create-intent", {
          amount: totalPrice,
        });
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create payment";
        toast.error(message);
      }
    };

    // Створюємо Payment Intent
    createPaymentIntent();
  }, [items, router, totalPrice]);

  // Заповнюємо email з профілю, якщо залогінений
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      toast.error("Платіжна система не готова");
      return;
    }

    // Валідація
    if (!email || !name) {
      toast.error("Заповніть всі поля");
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order/success`,
          payment_method_data: {
            billing_details: {
              email,
              name,
            },
          },
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Помилка при обробці платежу");
      } else if (paymentIntent?.status === "succeeded") {
        toast.success("Платіж успішний!");
        clearCart();
        router.push("/order/success");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Помилка при обробці платежу";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Оформлення замовлення</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Форма */}
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">Електронна пошта</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isProcessing}
                required
              />
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name">Ім&apos;я</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше ім'я"
                disabled={isProcessing}
                required
              />
            </div>

            {/* Card */}
            <div>
              <Label>Дані карти</Label>
              <div className="p-3 border border-gray-300 rounded-md">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#424770",
                        "::placeholder": {
                          color: "#aab7c4",
                        },
                      },
                      invalid: {
                        color: "#9e2146",
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!stripe || isProcessing || !clientSecret}
              className="w-full"
              size="lg"
            >
              {isProcessing
                ? "Обробка платежу..."
                : `Оплатити ₴${totalPrice.toFixed(2)}`}
            </Button>
          </form>
        </div>

        {/* Резюме замовлення */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Резюме замовлення</h2>

          <div className="space-y-3 mb-6 pb-6 border-b">
            {items.map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>₴{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-lg font-bold">
            <span>Разом:</span>
            <span>₴{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
