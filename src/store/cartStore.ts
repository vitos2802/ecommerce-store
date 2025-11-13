import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
  category: string;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
}

// Helper функція для обчислення totals
const calculateTotals = (items: CartItem[]) => {
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  return { totalQuantity, totalPrice };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalQuantity: 0,
      totalPrice: 0,

      addItem: (newItem) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) => item.productId === newItem.productId
        );

        let updatedItems: CartItem[];

        if (existingItemIndex !== -1) {
          // Товар вже в кошику — збільшуємо кількість
          updatedItems = currentItems.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
        } else {
          // Новий товар
          updatedItems = [...currentItems, newItem];
        }

        const { totalQuantity, totalPrice } = calculateTotals(updatedItems);
        set({
          items: updatedItems,
          totalQuantity,
          totalPrice,
        });
      },

      removeItem: (productId) => {
        const updatedItems = get().items.filter(
          (item) => item.productId !== productId
        );
        const { totalQuantity, totalPrice } = calculateTotals(updatedItems);

        set({
          items: updatedItems,
          totalQuantity,
          totalPrice,
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalQuantity: 0,
          totalPrice: 0,
        });
      },

      updateItemQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const updatedItems = get().items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );

        const { totalQuantity, totalPrice } = calculateTotals(updatedItems);
        set({
          items: updatedItems,
          totalQuantity,
          totalPrice,
        });
      },
    }),
    {
      name: "cart-store",
      storage:
        typeof window !== "undefined"
          ? {
              getItem: (key) => {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
              },
              setItem: (key, value) => {
                localStorage.setItem(key, JSON.stringify(value));
              },
              removeItem: (key) => {
                localStorage.removeItem(key);
              },
            }
          : undefined,
    }
  )
);
