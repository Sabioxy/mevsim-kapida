import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/providers/CartProvider";
import { TopNav } from "@/components/ui/TopNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mevsim Kapıda",
  description:
    "Sera üreticilerinden mevsiminde taze ürünleri tüketiciye doğrudan ulaştıran pazar yeri.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-emerald-900">
        <CartProvider>
          <TopNav />
          <div className="flex flex-1 flex-col">{children}</div>
        </CartProvider>
      </body>
    </html>
  );
}
