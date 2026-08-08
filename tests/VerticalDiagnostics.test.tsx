import { describe, expect, it } from "vitest";
import { auditHelmetState } from "../src/core/auditHelmetState";

describe("Vertical SEO Audit & Diagnostics", () => {
  it("diagnoses product offer missing price", () => {
    const state: any = {
      base: [],
      bodyAttributes: {},
      htmlAttributes: {},
      titleAttributes: {},
      defer: false,
      encodeSpecialCharacters: true,
      prioritizeSeoTags: false,
      link: [],
      meta: [],
      noscript: [],
      style: [],
      script: [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Test Gadget",
            offers: { "@type": "Offer", availability: "InStock" },
          }),
        },
      ],
    };

    const result = auditHelmetState(state);
    expect(result.diagnostics.some((d) => d.id === "RHP_SEO_PRODUCT_OFFER_MISSING_PRICE")).toBe(true);
  });

  it("diagnoses local business missing address and geo", () => {
    const state: any = {
      base: [],
      bodyAttributes: {},
      htmlAttributes: {},
      titleAttributes: {},
      defer: false,
      encodeSpecialCharacters: true,
      prioritizeSeoTags: false,
      link: [],
      meta: [],
      noscript: [],
      style: [],
      script: [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Local Cafe",
          }),
        },
      ],
    };

    const result = auditHelmetState(state);
    expect(result.diagnostics.some((d) => d.id === "RHP_SEO_LOCAL_BUSINESS_MISSING_ADDRESS")).toBe(true);
  });

  it("diagnoses video missing thumbnail", () => {
    const state: any = {
      base: [],
      bodyAttributes: {},
      htmlAttributes: {},
      titleAttributes: {},
      defer: false,
      encodeSpecialCharacters: true,
      prioritizeSeoTags: false,
      link: [],
      meta: [],
      noscript: [],
      style: [],
      script: [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: "Promo Video",
            uploadDate: "2026-08-08",
          }),
        },
      ],
    };

    const result = auditHelmetState(state);
    expect(result.diagnostics.some((d) => d.id === "RHP_SEO_VIDEO_MISSING_THUMBNAIL")).toBe(true);
  });

  it("diagnoses paywall cloaking warning and invalid CSS selectors", () => {
    const state: any = {
      base: [],
      bodyAttributes: {},
      htmlAttributes: {},
      titleAttributes: {},
      defer: false,
      encodeSpecialCharacters: true,
      prioritizeSeoTags: false,
      link: [],
      meta: [],
      noscript: [],
      style: [],
      script: [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            isAccessibleForFree: false,
            hasPart: [{ "@type": "WebPageElement", cssSelector: "{bad-selector}", isAccessibleForFree: false }],
          }),
        },
      ],
    };

    const result = auditHelmetState(state);
    expect(result.diagnostics.some((d) => d.id === "RHP_SEO_PAYWALL_INVALID_SELECTOR")).toBe(true);
  });
});
