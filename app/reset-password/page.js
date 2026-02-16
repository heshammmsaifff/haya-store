"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiLock, FiCheckCircle } from "react-icons/fi";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      // Success feedback
      alert("Password updated successfully.");
      router.push("/login");
    } catch (err) {
      setError(
        err.message || "Failed to update password. Link might be expired.",
      );
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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light tracking-[0.3em] uppercase text-black mb-3">
            NEW PASSWORD
          </h1>
          <div className="h-[1px] w-16 bg-black mx-auto mb-6"></div>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-semibold">
            Secure your account access
          </p>
        </div>

        {/* Content Card */}
        <div className="space-y-8">
          {error && (
            <div className="bg-black text-white text-[11px] p-4 border-l-4 border-red-500 font-medium tracking-wide italic">
              {error.toUpperCase()}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-black">
                New Password
              </label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b border-gray-200 py-3 pr-10 text-sm focus:border-black outline-none transition-colors placeholder:text-gray-300 bg-transparent"
                />
                <FiLock className="absolute right-0 text-gray-400" />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all disabled:bg-gray-200 group mt-8"
            >
              {loading ? (
                "SAVING..."
              ) : (
                <>
                  UPDATE PASSWORD <FiCheckCircle className="opacity-50" />
                </>
              )}
            </button>
          </form>

          {/* Back Link */}
          <div className="pt-8 border-t border-gray-100 text-center">
            <Link href="/login">
              <span className="text-[10px] text-gray-400 hover:text-black uppercase font-bold tracking-[0.2em] transition-colors cursor-pointer">
                Back to Sign In
              </span>
            </Link>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-16 text-center text-[9px] text-gray-400 uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} HAYA STORE . AUTHENTICATION SERVICE
        </div>
      </div>
    </div>
  );
}
