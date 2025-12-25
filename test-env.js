// test-env.js - Тестовий скрипт для перевірки .env
// Запустіть: node test-env.js

import dotenv from "dotenv";
dotenv.config();

console.log("🔍 Перевірка environment змінних:\n");

const vars = {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
};

// Перевірка кожної змінної
Object.entries(vars).forEach(([name, value]) => {
  if (!value) {
    console.log(`❌ ${name}: ВІДСУТНЯ`);
  } else {
    // Маскуємо значення
    console.log(`✅ ${name}: довжина - ${value.length}`);
    const masked =
      value.substring(0, 10) + "..." + value.substring(value.length - 4);
    console.log(`✅ ${name}: ${masked}`);

    // Додаткові перевірки
    if (name === "MONGODB_URI" && !value.startsWith("mongodb")) {
      console.log(`   ⚠️  Має починатися з "mongodb://" або "mongodb+srv://"`);
    }

    if (name === "JWT_SECRET" && value.length < 32) {
      console.log(
        `   ⚠️  Занадто короткий! Має бути мінімум 32 символи (зараз: ${value.length})`
      );
    }

    if (name === "STRIPE_SECRET_KEY" && !value.startsWith("sk_")) {
      console.log(`   ⚠️  Має починатися з "sk_"`);
    }

    if (
      name === "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" &&
      !value.startsWith("pk_")
    ) {
      console.log(`   ⚠️  Має починатися з "pk_"`);
    }
  }
});

console.log("\n📁 Файл .env знайдено у:", process.cwd());
