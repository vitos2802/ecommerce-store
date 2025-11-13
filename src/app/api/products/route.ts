import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
import { verifyAdmin, verifyUser } from "@/lib/auth/middleware";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Отримуємо query параметри
    const searchParams = request.nextUrl.searchParams;
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
      .select("name price image description category stock");

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
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Верифікуй admin (використай verifyAdmin та verifyUser)
    const user = await verifyUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    verifyAdmin(user);

    // 2. Отримай body з запиту
    const body = await request.json();
    // 3. Валідуй всі поля (name, price, description, image, stock, category)
    const { name, price, description, image, stock, category } = body;
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
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // 4. Підключись до БД
    await connectDB();
    // 5. Створи товар (Product.create)
    const newProduct = await Product.create({
      name,
      price,
      description,
      image,
      stock,
      category,
    });

    // 6. Повернули створений товар
    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    const err = error as Error;

    if (err.message === "Forbidden: Admin access required") {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 }
      );
    }

    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
