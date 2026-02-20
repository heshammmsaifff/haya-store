"use client";
import React, { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { FiSliders, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useSearchParams } from "next/navigation";

function CollectionContent() {
  const searchParams = useSearchParams();
  const categoryIdFromUrl = searchParams.get("category");
  const searchQueryFromUrl = searchParams.get("search");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    categoryIdFromUrl || "all",
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    if (categoryIdFromUrl) {
      setSelectedCategory(categoryIdFromUrl);
      setSelectedSubCategory(null);
    } else {
      setSelectedCategory("all");
    }
  }, [categoryIdFromUrl]);

  useEffect(() => {
    fetchData();
  }, [
    selectedCategory,
    selectedSubCategory,
    sortBy,
    inStockOnly,
    searchQueryFromUrl,
  ]);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: catData } = await supabase.from("categories").select(`
          id, name, sub_categories (id, name)
        `);
      setCategories(catData || []);

      let query = supabase.from("products").select(`
        *,
        sub_category:sub_categories!inner (
          id, name, category_id,
          category:categories (id, name)
        ),
        product_variants (is_available)
      `);

      if (searchQueryFromUrl) {
        query = query.ilike("name", `%${searchQueryFromUrl}%`);
      }
      if (selectedSubCategory) {
        query = query.eq("sub_category_id", selectedSubCategory);
      } else if (selectedCategory !== "all") {
        query = query.eq("sub_category.category_id", selectedCategory);
      }

      if (sortBy === "price-low")
        query = query.order("base_price", { ascending: true });
      else if (sortBy === "price-high")
        query = query.order("base_price", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      let formattedData = data.map((p) => ({
        ...p,
        category_name: p.sub_category?.category?.name || "HAYA",
        sub_category_name: p.sub_category?.name || "",
      }));

      if (inStockOnly) {
        formattedData = formattedData.filter((p) =>
          p.product_variants?.some((v) => v.is_available === true),
        );
      }
      setProducts(formattedData);
    } catch (error) {
      console.error("Fetch Error:", error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter uppercase mb-4">
              {searchQueryFromUrl
                ? `Search: ${searchQueryFromUrl}`
                : selectedSubCategory
                  ? categories
                      .flatMap((c) => c.sub_categories)
                      .find((s) => s.id === selectedSubCategory)?.name
                  : "All Collections"}
            </h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em]">
              Showing {products.length} Products
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] border border-black px-6 py-3 hover:bg-black hover:text-white transition-all"
            >
              <FiSliders size={14} />{" "}
              {showFilters ? "Close Filters" : "Filters"}
            </button>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent text-[10px] font-black uppercase tracking-[0.2em] border border-gray-200 px-6 py-3 pr-10 outline-none focus:border-black"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <FiChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                size={12}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-12">
        {showFilters && (
          <aside className="w-full md:w-64 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-6">
                Categories
              </h3>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedSubCategory(null);
                  }}
                  className={`text-left text-[10px] uppercase tracking-widest transition-all ${selectedCategory === "all" ? "font-black underline underline-offset-8" : "text-gray-400"}`}
                >
                  Shop All
                </button>
                {categories.map((cat) => (
                  <div key={cat.id} className="space-y-3">
                    <button
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubCategory(null);
                      }}
                      className={`text-left text-[10px] uppercase tracking-widest block w-full transition-all ${selectedCategory === cat.id && !selectedSubCategory ? " font-bold text-[14px] text-black" : "text-gray-500 text-[12px] hover:text-black"}`}
                    >
                      {cat.name}
                    </button>
                    {selectedCategory === cat.id && (
                      <div className="flex flex-col gap-2 pr-4 border-r border-black/10 animate-in fade-in slide-in-from-top-1 duration-300">
                        {cat.sub_categories?.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setSelectedSubCategory(sub.id);
                              setSelectedCategory(cat.id);
                            }}
                            className={`text-left text-[9px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${selectedSubCategory === sub.id ? "font-black text-black" : "text-gray-400 hover:text-black"}`}
                          >
                            {selectedSubCategory === sub.id && (
                              <FiChevronRight size={10} />
                            )}
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-50 aspect-[3/4]"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="h-[40vh] flex flex-col items-center justify-center">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400">
                No items matching your criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// المكون الأساسي الذي يحل مشكلة الـ Build
export default function CollectionPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center uppercase tracking-widest text-[10px]">
          Loading...
        </div>
      }
    >
      <CollectionContent />
    </Suspense>
  );
}
