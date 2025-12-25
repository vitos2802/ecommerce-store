import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { StripeProvider } from "@/components/providers/StripeProvider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-commerce Store",
  description: "Online store with products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <QueryProvider>
          <AuthProvider>
            <StripeProvider>
              <Header />
              <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
            </StripeProvider>
          </AuthProvider>
        </QueryProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
