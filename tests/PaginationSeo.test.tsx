import "@testing-library/jest-dom";
import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HelmetProvider } from "../src/context/HelmetProvider";
import { PaginationSeo } from "../src/components/PaginationSeo";

describe("PaginationSeo Component", () => {
  afterEach(() => {
    cleanup();
    document.title = "";
    document.head.innerHTML = "";
  });

  it("renders rel prev, rel next, canonical page URL, and page title into DOM", async () => {
    render(
      <HelmetProvider>
        <PaginationSeo
          title="Latest Blog Posts"
          baseUrl="https://example.com/blog"
          currentPage={2}
          totalPages={5}
        />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Latest Blog Posts - Page 2");
    });

    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://example.com/blog?page=2",
    );
    expect(document.querySelector('link[rel="prev"]')).toHaveAttribute(
      "href",
      "https://example.com/blog",
    );
    expect(document.querySelector('link[rel="next"]')).toHaveAttribute(
      "href",
      "https://example.com/blog?page=3",
    );
  });
});
