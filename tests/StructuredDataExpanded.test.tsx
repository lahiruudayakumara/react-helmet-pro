import "@testing-library/jest-dom";

import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CourseJsonLd } from "../src/components/CourseJsonLd";
import { EventJsonLd } from "../src/components/EventJsonLd";
import { JobPostingJsonLd } from "../src/components/JobPostingJsonLd";
import { LocalBusinessJsonLd } from "../src/components/LocalBusinessJsonLd";
import { ProductGroupJsonLd, ProductJsonLd } from "../src/components/ProductJsonLd";
import { RecipeJsonLd } from "../src/components/RecipeJsonLd";
import { HelmetProvider } from "../src/context/HelmetProvider";
import { safeJsonLdStringify } from "../src/next";
import {
  buildCourseSchema,
  buildDatasetSchema,
  buildDiscussionForumPostingSchema,
  buildEventSchema,
  buildJobPostingSchema,
  buildLocalBusinessSchema,
  buildMerchantReturnPolicySchema,
  buildOfferShippingDetailsSchema,
  buildProductGroupSchema,
  buildProductSchema,
  buildProfilePageSchema,
  buildRecipeSchema,
  buildSoftwareApplicationSchema,
  buildVideoObjectSchema,
} from "../src/utils/schemaBuilder";

describe("Expanded structured data support for Google search features", () => {
  afterEach(() => {
    cleanup();
    HelmetProvider.canUseDOM = true;
    document.title = "";
    document.head.innerHTML = "";
  });

  describe("Pure Schema Builders", () => {
    it("builds Product and Offer schemas with MerchantReturnPolicy & ShippingDetails", () => {
      const productSchema = buildProductSchema({
        brand: "Acme",
        description: "High performance widget",
        image: "https://example.com/widget.png",
        name: "Pro Widget",
        offers: {
          availability: "https://schema.org/InStock",
          hasMerchantReturnPolicy: {
            merchantReturnDays: 30,
            returnFees: "https://schema.org/FreeReturn",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          },
          price: 99.99,
          priceCurrency: "USD",
          shippingDetails: {
            shippingDestination: { addressCountry: "US" },
            shippingRate: { currency: "USD", value: 0 },
          },
        },
        sku: "ACME-WIDGET-01",
      });

      expect(productSchema).toEqual({
        "@context": "https://schema.org",
        "@type": "Product",
        brand: { "@type": "Brand", name: "Acme" },
        description: "High performance widget",
        image: "https://example.com/widget.png",
        name: "Pro Widget",
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            merchantReturnDays: 30,
            returnFees: "https://schema.org/FreeReturn",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          },
          price: 99.99,
          priceCurrency: "USD",
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "US",
            },
            shippingRate: {
              "@type": "MonetaryAmount",
              currency: "USD",
              value: 0,
            },
          },
        },
        sku: "ACME-WIDGET-01",
      });
    });

    it("builds JobPosting schema", () => {
      const jobSchema = buildJobPostingSchema({
        datePosted: "2026-07-29",
        description: "Looking for Senior React Engineer.",
        hiringOrganization: { name: "TechCorp" },
        jobLocation: { addressCountry: "US", addressLocality: "San Francisco" },
        title: "Senior React Engineer",
      });

      expect(jobSchema["@type"]).toBe("JobPosting");
      expect(jobSchema.title).toBe("Senior React Engineer");
    });

    it("builds Event & Recipe schemas", () => {
      const eventSchema = buildEventSchema({
        location: { address: "123 Main St", name: "Grand Hall" },
        name: "Developer Conference",
        startDate: "2026-09-01T09:00:00Z",
      });

      expect(eventSchema["@type"]).toBe("Event");

      const recipeSchema = buildRecipeSchema({
        image: "https://example.com/pie.jpg",
        name: "Apple Pie",
        recipeIngredient: ["Apples", "Flour", "Sugar"],
      });

      expect(recipeSchema["@type"]).toBe("Recipe");
      expect(recipeSchema.recipeIngredient).toHaveLength(3);
    });

    it("builds VideoObject, SoftwareApplication, ProfilePage, Forum, Course, and Dataset schemas", () => {
      expect(buildVideoObjectSchema({ description: "Video desc", name: "Demo Video", thumbnailUrl: "https://example.com/thumb.jpg", uploadDate: "2026-01-01" })["@type"]).toBe("VideoObject");
      expect(buildSoftwareApplicationSchema({ name: "AppPro", operatingSystem: "iOS" })["@type"]).toBe("SoftwareApplication");
      expect(buildProfilePageSchema({ mainEntity: { name: "Jane Doe" } })["@type"]).toBe("ProfilePage");
      expect(buildDiscussionForumPostingSchema({ author: "John", datePublished: "2026-01-01", headline: "Forum Topic" })["@type"]).toBe("DiscussionForumPosting");
      expect(buildCourseSchema({ name: "React Pro Mastery" })["@type"]).toBe("Course");
      expect(buildDatasetSchema({ description: "Open climate dataset", name: "Climate Data" })["@type"]).toBe("Dataset");
    });
  });

  describe("Safe JSON-LD Stringification & HTML Escaping", () => {
    it("escapes dangerous HTML characters to prevent XSS script injection", () => {
      const unsafeObject = {
        comment: "</script><script>alert('xss')</script>",
        htmlTag: "<div>Test & Demo</div>",
      };

      const safeJson = safeJsonLdStringify(unsafeObject);
      expect(safeJson).not.toContain("</script>");
      expect(safeJson).toContain("\\u003c/script>");
    });
  });

  describe("React JSON-LD Components", () => {
    it("renders ProductJsonLd component into DOM", async () => {
      render(
        <HelmetProvider>
          <ProductJsonLd
            product={{
              description: "Ergonomic chair",
              name: "Office Chair",
            }}
          />
        </HelmetProvider>,
      );

      await waitFor(() => {
        const script = document.querySelector('script[type="application/ld+json"]');
        expect(script).toBeInTheDocument();
        const json = JSON.parse(script?.innerHTML ?? "{}");
        expect(json["@type"]).toBe("Product");
        expect(json.name).toBe("Office Chair");
      });
    });
  });
});
