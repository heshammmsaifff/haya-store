"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiUser,
  FiPackage,
  FiLogOut,
  FiChevronRight,
  FiRefreshCw,
  FiMail,
} from "react-icons/fi";

import { PiExclamationMarkFill } from "react-icons/pi";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      setLoading(true);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setProfile({
        ...profileData,
        full_name:
          profileData?.full_name ||
          user?.user_metadata?.full_name ||
          "Guest User",
      });

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  const handlePasswordReset = async () => {
    try {
      setResetLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      alert("A password reset link has been sent to your email.");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white italic font-light tracking-[0.2em]">
        LOADING ACCOUNT...
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20">
      {/* Header Section */}
      <div className="border-b border-gray-100 p-8 pt-16 text-center">
        <div className="w-20 h-20 bg-black text-white rounded-full mx-auto flex items-center justify-center text-2xl font-light mb-4 uppercase">
          {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
        </div>
        <h1 className="text-2xl font-light tracking-[0.2em] uppercase">
          {profile?.full_name || "My Account"}
        </h1>
        <p className="text-gray-400 text-xs mt-2 tracking-widest">
          {user?.email}
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Navigation Sidebar */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 border-b pb-2">
              Navigation
            </h3>
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-3 text-sm font-medium transition-all ${activeTab === "orders" ? "text-black pl-2 border-l-2 border-black" : "text-gray-400 hover:text-black"}`}
              >
                <FiPackage size={18} /> My Orders
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`flex items-center gap-3 text-sm font-medium transition-all ${activeTab === "details" ? "text-black pl-2 border-l-2 border-black" : "text-gray-400 hover:text-black"}`}
              >
                <FiUser size={18} /> Account Details
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-sm font-bold text-red-500 pt-4 border-t border-gray-50 hover:pl-2 transition-all"
              >
                <FiLogOut size={18} /> Sign Out
              </button>
            </nav>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="md:col-span-2 space-y-8">
          {activeTab === "orders" ? (
            <>
              <h2 className="text-sm font-bold uppercase tracking-[0.1em]">
                Recent Orders ({orders.length})
              </h2>
              {orders.length === 0 ? (
                <div className="border border-dashed border-gray-200 p-12 text-center">
                  <p className="text-gray-400 text-sm italic mb-6">
                    No orders found.
                  </p>
                  <Link
                    href="/shop"
                    className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-100 p-6 flex justify-between items-center group hover:border-black transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </p>
                        <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-1 mt-2 inline-block bg-gray-100 text-gray-600">
                          {order.status}
                        </span>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <p className="font-bold text-sm">
                          {order.total_amount} LE
                        </p>
                        <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-sm font-bold uppercase tracking-[0.1em]">
                Account Details
              </h2>
              <div className="border border-black p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Full Name
                  </span>
                  <span className="text-sm font-medium">
                    {profile?.full_name}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Email Address
                  </span>
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Member Since
                  </span>
                  <span className="text-sm font-medium">
                    {/* The requested date format: 12 Feb 2026 */}
                    {new Date(user?.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handlePasswordReset}
                    disabled={resetLoading}
                    className="flex items-center justify-between w-full p-4 border border-black hover:bg-black hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest">
                      <FiRefreshCw
                        className={
                          resetLoading
                            ? "animate-spin"
                            : "group-hover:rotate-180 transition-transform duration-500"
                        }
                      />
                      {resetLoading ? "Sending..." : "Reset Password"}
                    </div>
                    <FiMail />
                  </button>
                  <p className="text-[15px] text-gray-800 mt-2 italic">
                    <PiExclamationMarkFill className="inline" size={"20px"} />{" "}
                    We will send a secure link to your email to update your
                    password.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
