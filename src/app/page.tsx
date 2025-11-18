import { ProductList } from "@/components/products/ProductList";

export default function Home() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Каталог товарів</h1>
      <ProductList />
    </div>
  );
}
