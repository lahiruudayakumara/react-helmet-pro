import "@testing-library/jest-dom";
import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HelmetProvider } from "../src/context/HelmetProvider";
import { ImageSeo } from "../src/components/ImageSeo";

describe("ImageSeo Component", () => {
  afterEach(() => {
    cleanup();
    document.title = "";
    document.head.innerHTML = "";
  });

  it("renders ImageObject metadata and JSON-LD schema into DOM", async () => {
    render(
      <HelmetProvider>
        <ImageSeo
          title="Sunset over San Francisco Bay"
          imageUrl="https://example.com/photos/sunset.jpg"
          creditText="Photo by Jane Doe"
          creator="Jane Doe"
          license="https://creativecommons.org/licenses/by/4.0/"
        />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Sunset over San Francisco Bay");
    });

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent ?? "{}");
    expect(parsed["@type"]).toBe("ImageObject");
    expect(parsed.contentUrl).toBe("https://example.com/photos/sunset.jpg");
  });
});
