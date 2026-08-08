import "@testing-library/jest-dom";
import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HelmetProvider } from "../src/context/HelmetProvider";
import { PaywalledSeo } from "../src/components/PaywalledSeo";

describe("PaywalledSeo Component", () => {
  afterEach(() => {
    cleanup();
    document.title = "";
    document.head.innerHTML = "";
  });

  it("renders paywalled JSON-LD WebPage schema into DOM", async () => {
    render(
      <HelmetProvider>
        <PaywalledSeo
          title="Exclusive Industry Report"
          description="In-depth analysis of market trends"
          isAccessibleForFree={false}
          parts={[
            { cssSelector: ".free-summary", isAccessibleForFree: true },
            { cssSelector: ".premium-content", isAccessibleForFree: false },
          ]}
        />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Exclusive Industry Report");
    });

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent ?? "{}");
    expect(parsed["@type"]).toBe("WebPage");
    expect(parsed.isAccessibleForFree).toBe(false);
  });
});
