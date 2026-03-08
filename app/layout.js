import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://hayaalaa.com"),

  title: {
    default: "Haya Alaa",
    template: "%s | Haya Alaa",
  },

  description:
    "Haya Alaa minimalist fashion store offering elegant modern clothing.",

  keywords: [
    "Haya Alaa",
    "Minimalist fashion",
    "Women clothing",
    "Women fashion",
    "هايا علاء",
    "ملابس حريمي",
    "موضة حريمي",
    "فساتين حريمي",
  ],

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://hayaalaa.com",
  },

  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased bg-white`}>
        <CartProvider>
          <Toaster position="bottom-center" reverseOrder={false} />
          <Navbar />
          <main className="min-h-screen pt-20">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
