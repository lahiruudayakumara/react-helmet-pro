import "@testing-library/jest-dom";
import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HelmetProvider } from "../src/context/HelmetProvider";
import { ProductSeo } from "../src/components/ProductSeo";

describe("ProductSeo Component", () => {
  afterEach(() => {
    cleanup();
    document.title = "";
    document.head.innerHTML = "";
  });

  it("renders Product title, description, canonical link, and JSON-LD schema into DOM", async () => {
    render(
      <HelmetProvider>
        <ProductSeo
          title="Premium Wireless Headphones"
          description="High-fidelity noise cancelling audio"
          canonical="https://example.com/products/headphones"
          brand="AudioPro"
          sku="AP-100"
          images={[{ url: "https://example.com/images/headphones.jpg" }]}
          offers={[
            {
              price: 199.99,
              priceCurrency: "USD",
              availability: "InStock",
            },
          ]}
          rating={{
            ratingValue: 4.8,
            ratingCount: 120,
          }}
          breadcrumbs={[
            { name: "Home", item: "https://example.com" },
            { name: "Audio", item: "https://example.com/audio" },
            { name: "Headphones", item: "https://example.com/products/headphones" },
          ]}
        />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Premium Wireless Headphones");
    });

    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      "High-fidelity noise cancelling audio",
    );
    expect(document.querySelector('meta[property="og:price:amount"]')).toHaveAttribute(
      "content",
      "199.99",
    );
    expect(document.querySelector('meta[property="og:price:currency"]')).toHaveAttribute(
      "content",
      "USD",
    );

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent ?? "{}");
    expect(parsed["@type"]).toBe("Product");
    expect(parsed.name).toBe("Premium Wireless Headphones");
  });
});
