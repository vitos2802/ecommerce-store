import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
import { withAdmin, withOptionalAuth } from "@/lib/auth/apiMiddleware";

// ============================================
// GET /api/products - Отримати список товарів
// ============================================
// Публічний роут (опціональна авторизація для персоналізації)
export async function GET(request: NextRequest): Promise<NextResponse> {
  return withOptionalAuth(request, async (req, { user }) => {
    try {
      // Отримуємо query параметри
      const searchParams = req.nextUrl.searchParams;
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const category = searchParams.get("category");

      // Валідація пагінації
      if (page < 1 || limit < 1) {
        return NextResponse.json(
          { error: "Page and limit must be greater than 0" },
          { status: 400 }
        );
      }

      // Підключення до БД
      await connectDB();

      // Будуємо фільтр
      const filter: { category?: string } = {};
      if (category) {
        filter.category = category;
      }

      // Отримуємо загальну кількість товарів для фільтра
      const total = await Product.countDocuments(filter);

      // Отримуємо товари з пагінацією
      const products = await Product.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .select("name price image description category stock")
        .lean(); // ✅ Швидше на 2-3x

      // Обчислюємо кількість сторінок
      const pages = Math.ceil(total / limit);

      return NextResponse.json(
        {
          success: true,
          products,
          pagination: {
            total,
            page,
            limit,
            pages,
          },
          // Додаткова інформація, якщо користувач залогінений
          ...(user && { userId: user.userId }),
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get products error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

// ============================================
// POST /api/products - Створити товар
// ============================================
// Захищений роут (тільки для адмінів)
export async function POST(request: NextRequest): Promise<NextResponse> {
  return withAdmin(request, async (req, { user }) => {
    try {
      // Отримуємо body з запиту
      const body = await req.json();
      const { name, price, description, image, stock, category } = body;

      // Валідація всіх полів
      if (
        !name ||
        !price ||
        !description ||
        !image ||
        stock === undefined ||
        !category
      ) {
        return NextResponse.json(
          { error: "All fields are required" },
          { status: 400 }
        );
      }

      if (typeof price !== "number" || price <= 0) {
        return NextResponse.json(
          { error: "Price must be a positive number" },
          { status: 400 }
        );
      }

      const validCategories = [
        "Electronics",
        "Clothing",
        "Books",
        "Home",
        "Other",
      ];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
      }

      // Підключаємось до БД
      await connectDB();

      // Створюємо товар
      const newProduct = await Product.create({
        name,
        price,
        description,
        image,
        stock,
        category,
      });

      // Логування (хто створив товар)
      console.log(`Product created by admin: ${user.email} (${user.userId})`);

      return NextResponse.json(
        { success: true, product: newProduct },
        { status: 201 }
      );
    } catch (error) {
      console.error("Create product error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
