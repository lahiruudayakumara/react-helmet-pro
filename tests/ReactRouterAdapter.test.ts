import { describe, expect, it } from "vitest";
import { createReactRouterMeta, defineRouteSeo, toReactRouterMeta } from "../src/react-router";
import { HelmetData } from "../src/core/HelmetData";

describe("React Router Adapter", () => {
  it("converts Helmet state into React Router meta descriptors", () => {
    const helmetData = new HelmetData({});
    const descriptors = toReactRouterMeta({
      title: "Products Page",
      meta: [
        { name: "description", content: "Awesome products" },
        { property: "og:image", content: "https://example.com/og.png" },
        { charSet: "utf-8" },
      ],
      script: [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: "Gadget" }),
        },
      ],
      link: [{ rel: "canonical", href: "https://example.com/products" }],
    });

    expect(descriptors).toEqual([
      { title: "Products Page" },
      { name: "description", content: "Awesome products" },
      { property: "og:image", content: "https://example.com/og.png" },
      { charSet: "utf-8" },
      { "script:ld+json": { "@context": "https://schema.org", "@type": "Product", name: "Gadget" } },
      { tagName: "link", rel: "canonical", href: "https://example.com/products" },
    ]);
  });

  it("handles loader data with defineRouteSeo and createReactRouterMeta", () => {
    const routeSeo = defineRouteSeo<{ title: string; desc: string }>((data: { title: any; desc: any; }) => ({
      title: data.title,
      meta: [{ name: "description", content: data.desc }],
    }));

    const metaFn = createReactRouterMeta<{ title: string; desc: string }>(routeSeo);
    const result = metaFn({ data: { title: "Dashboard", desc: "User dashboard" } });

    expect(result).toEqual([
      { title: "Dashboard" },
      { name: "description", content: "User dashboard" },
    ]);
  });

  it("returns empty array when input is undefined", () => {
    expect(toReactRouterMeta(undefined)).toEqual([]);
  });
});
