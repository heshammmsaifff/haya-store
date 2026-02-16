"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiLock, FiMail, FiArrowRight } from "react-icons/fi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Debugging point 1
    console.log("Attempting to sign in user...");

    try {
      // 1. Auth: تسجيل الدخول الأساسي
      const { data: authData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) throw loginError;

      const user = authData.user;
      console.log("Auth successful, User ID:", user.id);

      // 2. Profile Check: التأكد من الصلاحيات
      // استعملنا maybeSingle عشان لو مفيش بروفايل ميرجعش Error يوقف الكود
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile query error:", profileError.message);
        // حتى لو فشل البروفايل، هنخليه يكمل للصفحة الرئيسية بدل ما يعلق
      }

      console.log("Profile data received:", profile);

      // 3. Smart Redirection
      // 3. Smart Redirection (التعديل الصحيح)
      if (profile && profile.is_admin === true) {
        console.log("User is Admin, forcing redirect to dashboard...");
        // استخدام window.location.href بيضمن إن الـ Cookies تسمع في الـ Middleware
        window.location.href = "/admin/dashboard";
      } else {
        console.log("User is regular client, redirecting to home...");
        window.location.href = "/";
      }

      // اختياري: Refresh بسيط لو حاسس إن الحالة معلقة
      router.refresh();

      // عمل refresh للتأكد من تحديث حالة الـ Session في التطبيق
      router.refresh();
    } catch (err) {
      console.error("Login process caught error:", err.message);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-6 font-sans text-left"
      dir="ltr"
    >
      <div className="w-full max-w-[400px]">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <Link href="/">
            <h1 className="text-3xl font-light tracking-[0.3em] uppercase text-black mb-3 cursor-pointer">
              HAYA STORE
            </h1>
          </Link>
          <div className="h-[1px] w-16 bg-black mx-auto mb-6"></div>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-semibold">
            Account Authentication
          </p>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {error && (
            <div className="bg-black text-white text-[11px] p-4 border-l-4 border-red-500 font-medium tracking-wide">
              {error.toUpperCase()}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-black">
                Email Address
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@domain.com"
                  className="w-full border-b border-gray-200 py-3 pr-10 text-sm focus:border-black outline-none transition-colors placeholder:text-gray-300 bg-transparent"
                />
                <FiMail className="absolute right-0 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-black">
                  Password
                </label>
                <Link href="/forgot-password">
                  <span className="text-[9px] text-gray-400 hover:text-black transition-colors cursor-pointer uppercase tracking-tighter">
                    Forgot Password?
                  </span>
                </Link>
              </div>
              <div className="relative flex items-center">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-b border-gray-200 py-3 pr-10 text-sm focus:border-black outline-none transition-colors placeholder:text-gray-300 bg-transparent"
                />
                <FiLock className="absolute right-0 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all disabled:bg-gray-200 group mt-8"
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  Sign In{" "}
                  <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-8 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-500 tracking-wide">
              Dont have an account?{" "}
              <Link href="/signup">
                <span className="text-black font-bold border-b border-black pb-0.5 cursor-pointer ml-1">
                  Create One
                </span>
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-[9px] text-gray-400 uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} HAYA STORE . ESTABLISHED IN EGYPT
        </div>
      </div>
    </div>
  );
}
