import "@testing-library/jest-dom";
import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HelmetProvider } from "../src/context/HelmetProvider";
import { LocalBusinessSeo } from "../src/components/LocalBusinessSeo";

describe("LocalBusinessSeo Component", () => {
  afterEach(() => {
    cleanup();
    document.title = "";
    document.head.innerHTML = "";
  });

  it("renders LocalBusiness name, address, geo meta tags, and JSON-LD schema into DOM", async () => {
    render(
      <HelmetProvider>
        <LocalBusinessSeo
          name="Tech Bakery & Cafe"
          description="Artisanal bakery and coffee shop"
          address={{
            streetAddress: "123 Main St",
            addressLocality: "San Francisco",
            addressRegion: "CA",
            postalCode: "94105",
            addressCountry: "US",
          }}
          geo={{
            latitude: 37.7749,
            longitude: -122.4194,
          }}
          openingHours={[
            { dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "07:00", closes: "18:00" },
          ]}
          telephone="+1-415-555-0199"
        />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Tech Bakery & Cafe");
    });

    expect(document.querySelector('meta[name="geo.position"]')).toHaveAttribute(
      "content",
      "37.7749;-122.4194",
    );
    expect(document.querySelector('meta[name="ICBM"]')).toHaveAttribute(
      "content",
      "37.7749, -122.4194",
    );

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent ?? "{}");
    expect(parsed["@type"]).toBe("LocalBusiness");
    expect(parsed.name).toBe("Tech Bakery & Cafe");
  });
});
