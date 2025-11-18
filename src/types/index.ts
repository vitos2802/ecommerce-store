export interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  description: string;
  category: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

export interface CartItem extends Product {
  quantity: number;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}
