import Link from "next/link";
import { FiInstagram, FiFacebook, FiUsers } from "react-icons/fi"; // FiUsers للجروب
import { FaTiktok } from "react-icons/fa";

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
            Collections
          </h3>
          <ul className="space-y-4 text-xs text-gray-500 tracking-widest uppercase">
            <li>
              <Link href="/collections" className="hover:text-black">
                All Collections
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-black">
                Categories
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
              <Link href="/contact" className="hover:text-black">
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                target="_blank"
                href="https://www.google.com/maps/place/30%C2%B043'33.8%22N+31%C2%B047'18.2%22E/@30.7257536,31.7883165,374m/data=!3m1!1e3!4m4!3m3!8m2!3d30.7260556!4d31.7883889?hl=en&entry=ttu&g_ep=EgoyMDI2MDIxNy4wIKXMDSoASAFQAw%3D%3D"
                className="hover:text-black"
              >
                Our Location
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-black">
            Follow Us
          </h3>
          <div className="flex gap-5 items-center">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/hayaalaa_official"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-50 transition-opacity"
              title="Instagram"
            >
              <FiInstagram size={20} />
            </a>

            {/* Facebook Page */}
            <a
              href="https://www.facebook.com/share/1JWFEd79SC/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-50 transition-opacity"
              title="Facebook Page"
            >
              <FiFacebook size={20} />
            </a>

            {/* Facebook Group */}
            <a
              href="https://www.facebook.com/share/g/17v76e1RbX/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-50 transition-opacity"
              title="Facebook Group"
            >
              <FiUsers size={20} />
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@hayaalaaofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-50 transition-opacity"
              title="TikTok"
            >
              <FaTiktok size={18} />
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
