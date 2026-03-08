import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

export default async function sitemap() {
  const baseUrl = "https://hayaalaa.com";

  const { data: products } = await supabase
    .from("products")
    .select("id, created_at");

  const productUrls =
    products?.map((product) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: product.created_at || new Date(),
    })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
    },
    ...productUrls,
  ];
}
