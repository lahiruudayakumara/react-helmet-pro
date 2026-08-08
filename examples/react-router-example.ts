import { createReactRouterMeta, defineRouteSeo } from "react-helmet-pro/react-router";

// 1. Define route loader
export async function loader() {
  return {
    product: {
      id: "p123",
      title: "Super-Speed Wireless Headphones",
      description: "High-fidelity noise cancelling wireless headphones with 40-hour battery life.",
      image: "https://example.com/images/headphones.jpg",
      canonical: "https://example.com/products/p123",
    },
  };
}

// 2. Define route SEO from loader data
export const meta = createReactRouterMeta(
  defineRouteSeo(({ data }: { data?: ReturnType<typeof loader> extends Promise<infer U> ? U : never }) => {
    if (!data?.product) {
      return { title: "Product Not Found" };
    }

    return {
      title: data.product.title,
      meta: [
        { name: "description", content: data.product.description },
        { property: "og:title", content: data.product.title },
        { property: "og:description", content: data.product.description },
        { property: "og:image", content: data.product.image },
      ],
      link: [{ rel: "canonical", href: data.product.canonical }],
      script: [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: data.product.title,
            description: data.product.description,
            image: data.product.image,
          }),
        },
      ],
    };
  }),
);
