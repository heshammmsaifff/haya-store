import { supabase } from "@/lib/supabase";

export default async function sitemap() {
  const baseUrl = "https://hayaalaa.com";

  const { data: products } = await supabase
    .from("products")
    .select("id, updated_at");

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updated_at,
  }));

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
