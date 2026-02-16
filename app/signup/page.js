"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiUser, FiArrowRight } from "react-icons/fi";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({
        type: "success",
        text: "Confirmation link sent to your email address.",
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
          <Link href="/">
            <h1 className="text-3xl font-light tracking-[0.3em] uppercase text-black mb-3 cursor-pointer">
              HAYA STORE
            </h1>
          </Link>
          <div className="h-[1px] w-16 bg-black mx-auto mb-6"></div>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-semibold">
            Create New Account
          </p>
        </div>

        {/* Form Section */}
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

          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-black">
                Full Name
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border-b border-gray-200 py-3 pr-10 text-sm focus:border-black outline-none transition-colors placeholder:text-gray-300 bg-transparent"
                />
                <FiUser className="absolute right-0 text-gray-400" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-black">
                Email Address
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b border-gray-200 py-3 pr-10 text-sm focus:border-black outline-none transition-colors placeholder:text-gray-300 bg-transparent"
                />
                <FiMail className="absolute right-0 text-gray-400" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-black">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  required
                  placeholder="Create a password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b border-gray-200 py-3 pr-10 text-sm focus:border-black outline-none transition-colors placeholder:text-gray-300 bg-transparent"
                />
                <FiLock className="absolute right-0 text-gray-400" />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all disabled:bg-gray-200 group mt-4"
            >
              {loading ? (
                "PROCESSING..."
              ) : (
                <>
                  Create Account{" "}
                  <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="pt-8 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-500 tracking-wide">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-black font-bold border-b border-black pb-0.5 cursor-pointer ml-1">
                  Sign In
                </span>
              </Link>
            </p>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-16 text-center text-[9px] text-gray-400 uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} HAYA STORE . JOIN THE COMMUNITY
        </div>
      </div>
    </div>
  );
}
