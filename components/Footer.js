import Link from "next/link";
import { FiInstagram, FiFacebook } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <h2 className="text-lg font-light tracking-[0.3em] uppercase mb-6">
            Haya Store
          </h2>
          <p className="text-gray-400 text-xs leading-relaxed tracking-wider">
            Elevating your everyday wardrobe with minimalist essentials and
            timeless designs.
          </p>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-black">
            Shop
          </h3>
          <ul className="space-y-4 text-xs text-gray-500 tracking-widest uppercase">
            <li>
              <Link href="/shop" className="hover:text-black">
                All Collections
              </Link>
            </li>
            <li>
              <Link href="/new-arrivals" className="hover:text-black">
                New Arrivals
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-black">
            Support
          </h3>
          <ul className="space-y-4 text-xs text-gray-500 tracking-widest uppercase">
            <li>
              <Link href="/shipping" className="hover:text-black">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/returns" className="hover:text-black">
                Returns & Exchanges
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-black">
            Follow Us
          </h3>
          <div className="flex gap-4">
            <a href="#" className="hover:opacity-50">
              <FiInstagram size={20} />
            </a>
            <a href="#" className="hover:opacity-50">
              <FiFacebook size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em]">
          &copy; {new Date().getFullYear()} HAYA STORE. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
