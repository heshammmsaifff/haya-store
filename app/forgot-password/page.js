"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { FiMail, FiChevronLeft, FiArrowLeft } from "react-icons/fi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({
        type: "success",
        text: "Recovery link has been sent to your email.",
      });
    }
    setLoading(false);
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
            RECOVER
          </h1>
          <div className="h-[1px] w-16 bg-black mx-auto mb-6"></div>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-semibold">
            Reset your access password
          </p>
        </div>

        {/* Content Card */}
        <div className="space-y-8">
          {message && (
            <div
              className={`text-[11px] p-4 border-l-4 font-medium tracking-wide italic ${
                message.type === "error"
                  ? "bg-black text-white border-red-500"
                  : "bg-gray-50 text-black border-green-500"
              }`}
            >
              {message.text.toUpperCase()}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-black">
                Registered Email
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  placeholder="e.g. name@domain.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b border-gray-200 py-3 pr-10 text-sm focus:border-black outline-none transition-colors placeholder:text-gray-300 bg-transparent"
                />
                <FiMail className="absolute right-0 text-gray-400" />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all disabled:bg-gray-200 group mt-8"
            >
              {loading ? "SENDING..." : "SEND RECOVERY LINK"}
            </button>
          </form>

          {/* Navigation */}
          <div className="pt-8 border-t border-gray-100 text-center">
            <Link
              href="/login"
              className="text-[10px] text-gray-400 flex items-center justify-center gap-2 hover:text-black uppercase font-bold tracking-[0.2em] transition-colors cursor-pointer group"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />{" "}
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-16 text-center text-[9px] text-gray-400 uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} HAYA STORE . SECURITY PROTOCOL
        </div>
      </div>
    </div>
  );
}
