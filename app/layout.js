import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Haya Store",
  description: "Haya Store | Minimalist Fashion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased bg-white`}>
        {/* نغلف التطبيق بالـ CartProvider ليعمل في كل الصفحات */}
        <CartProvider>
          <Navbar />
          {/* نضع pt-20 لتعويض ارتفاع الـ Navbar الـ Fixed */}
          <main className="min-h-screen pt-20">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
