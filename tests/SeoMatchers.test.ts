import { beforeAll, describe, expect, it } from "vitest";
import { registerMatchers } from "../src/testing/index";
import type { HelmetState } from "../src/types/tags";

// Register custom matchers for testing
registerMatchers();

describe("Custom SEO Matchers", () => {
  // Test data in 3 formats: HTML string, HelmetState, DOM (parsed element)

  describe("toHaveCanonical", () => {
    it("matches canonical link in HTML string", () => {
      const html = '<html><head><link rel="canonical" href="https://example.com/canonical-test" /></head></html>';
      expect(html).toHaveCanonical("https://example.com/canonical-test");
      expect(html).not.toHaveCanonical("https://example.com/other");
    });

    it("matches canonical link in HelmetState", () => {
      const state: Partial<HelmetState> = {
        link: [{ rel: "canonical", href: "https://example.com/canonical-test" }],
      };
      expect(state).toHaveCanonical("https://example.com/canonical-test");
    });

    it("matches canonical link in DOM element", () => {
      const div = document.createElement("div");
      div.innerHTML = '<link rel="canonical" href="https://example.com/canonical-test" />';
      expect(div).toHaveCanonical("https://example.com/canonical-test");
    });

  });

  describe("toBeIndexable", () => {
    it("asserts indexable when no robots meta is present", () => {
      const html = "<html><head><title>No Robots</title></head></html>";
      expect(html).toBeIndexable();
    });

    it("asserts indexable when robots contains index, follow", () => {
      const html = '<html><head><meta name="robots" content="index, follow" /></head></html>';
      expect(html).toBeIndexable();
    });

    it("asserts NOT indexable when robots contains noindex", () => {
      const html = '<html><head><meta name="robots" content="noindex, nofollow" /></head></html>';
      expect(html).not.toBeIndexable();
    });

    it("asserts NOT indexable when googlebot contains noindex", () => {
      const state: Partial<HelmetState> = {
        meta: [{ name: "googlebot", content: "noindex" }],
      };
      expect(state).not.toBeIndexable();
    });
  });

  describe("toHaveHreflang", () => {
    it("matches hreflang alternate link in HTML string", () => {
      const html = '<html><head><link rel="alternate" hreflang="fr" href="https://example.com/fr" /></head></html>';
      expect(html).toHaveHreflang("fr");
      expect(html).toHaveHreflang("fr", "https://example.com/fr");
      expect(html).not.toHaveHreflang("en");
    });

    it("matches hreflang alternate link in HelmetState", () => {
      const state: Partial<HelmetState> = {
        link: [{ rel: "alternate", hrefLang: "es", href: "https://example.com/es" }],
      };
      expect(state).toHaveHreflang("es", "https://example.com/es");
    });
  });

  describe("toHaveValidStructuredData", () => {
    it("parses valid JSON-LD structure and matches type", () => {
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Test Product",
        offers: {
          "@type": "Offer",
          price: "10.00",
        },
      };
      const html = `<html><head><script type="application/ld+json">${JSON.stringify(jsonLd)}</script></head></html>`;
      expect(html).toHaveValidStructuredData();
      expect(html).toHaveValidStructuredData("Product");
      expect(html).toHaveValidStructuredData("Product", { name: "Test Product" });
      expect(html).toHaveValidStructuredData("Product", { offers: { price: "10.00" } });
      expect(html).not.toHaveValidStructuredData("Book");
    });

    it("handles invalid JSON-LD", () => {
      const html = '<html><head><script type="application/ld+json">{ invalid json }</script></head></html>';
      expect(html).not.toHaveValidStructuredData();
    });
  });
});
