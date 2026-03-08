import ProductDetails from "./ProductDetails";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const { data: product } = await supabase
    .from("products")
    .select("name, description, image_url, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!product) {
    return {
      title: "Product Not Found | Haya Alaa",
      description: "This product does not exist.",
    };
  }

  return {
    title: `${product.name} | Haya Alaa`,
    description:
      product.description ||
      `Buy ${product.name} from Haya Alaa minimalist fashion store.`,

    openGraph: {
      title: product.name,
      description: product.description,
      url: `https://hayaalaa.com/products/${product.slug}`,
      images: [
        {
          url: product.image_url || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.image_url],
    description: product.description,
    brand: {
      "@type": "Brand",
      name: "Haya Alaa",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      price: product.base_price,
      availability: "https://schema.org/InStock",
      url: `https://hayaalaa.com/products/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />

      <ProductDetails product={product} />
    </>
  );
}
