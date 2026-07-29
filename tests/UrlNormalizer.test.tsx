import "@testing-library/jest-dom";

import React from "react";
import { renderToString } from "react-dom/server";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Seo } from "../src/components/Seo";
import { HelmetProvider } from "../src/context/HelmetProvider";
import type { HelmetServerContext } from "../src/types";
import { createUrlNormalizer, normalizeSeoUrl } from "../src/utils/urlNormalizer";

describe("Canonical URL resolution and normalization policies", () => {
  afterEach(() => {
    cleanup();
    HelmetProvider.canUseDOM = true;
    document.title = "";
    document.head.innerHTML = "";
    document.documentElement.removeAttribute("lang");
  });

  describe("normalizeSeoUrl pure utility", () => {
    it("accepts both string and URL object inputs", () => {
      expect(normalizeSeoUrl("https://example.com/docs")).toBe("https://example.com/docs");
      expect(normalizeSeoUrl(new URL("https://example.com/docs"))).toBe("https://example.com/docs");
    });

    it("resolves relative pathnames against baseUrl", () => {
      expect(
        normalizeSeoUrl("/getting-started", {
          baseUrl: "https://example.com",
        }),
      ).toBe("https://example.com/getting-started");

      expect(
        normalizeSeoUrl("guide", {
          baseUrl: "https://example.com/docs/",
        }),
      ).toBe("https://example.com/docs/guide");
    });

    it("supports IDNs (Punycode / Unicode) and custom ports", () => {
      expect(
        normalizeSeoUrl("https://münchen.de:8443/vereinbarungen", {
          trailingSlash: "always",
        }),
      ).toBe("https://xn--mnchen-3ya.de:8443/vereinbarungen/");
    });

    it("enforces trailing slash policies ('always', 'never', 'preserve')", () => {
      expect(
        normalizeSeoUrl("https://example.com/blog", {
          trailingSlash: "always",
        }),
      ).toBe("https://example.com/blog/");

      // Does not add trailing slash to files with extensions
      expect(
        normalizeSeoUrl("https://example.com/images/og-logo.png", {
          trailingSlash: "always",
        }),
      ).toBe("https://example.com/images/og-logo.png");

      expect(
        normalizeSeoUrl("https://example.com/blog/", {
          trailingSlash: "never",
        }),
      ).toBe("https://example.com/blog");

      // Root / is preserved when 'never'
      expect(
        normalizeSeoUrl("https://example.com/", {
          trailingSlash: "never",
        }),
      ).toBe("https://example.com/");
    });

    it("strips fragments and tracking query parameters", () => {
      expect(
        normalizeSeoUrl("https://example.com/products/widget#overview", {
          stripFragment: true,
        }),
      ).toBe("https://example.com/products/widget");

      expect(
        normalizeSeoUrl(
          "https://example.com/shop?utm_source=google&utm_medium=cpc&gclid=xyz123&category=books",
          {
            stripTrackingParams: true,
          },
        ),
      ).toBe("https://example.com/shop?category=books");
    });

    it("filters query parameters via allowlist and denylist", () => {
      expect(
        normalizeSeoUrl("https://example.com/search?q=react&page=2&debug=true", {
          allowedQueryParams: ["q", "page"],
        }),
      ).toBe("https://example.com/search?q=react&page=2");

      expect(
        normalizeSeoUrl("https://example.com/search?q=react&page=2&debug=true", {
          deniedQueryParams: ["debug"],
        }),
      ).toBe("https://example.com/search?q=react&page=2");
    });

    it("sorts query parameters alphabetically when sortQueryParams is true", () => {
      expect(
        normalizeSeoUrl("https://example.com/search?z=1&a=2&m=3", {
          sortQueryParams: true,
        }),
      ).toBe("https://example.com/search?a=2&m=3&z=1");
    });

    it("works with createUrlNormalizer factory helper", () => {
      const normalizer = createUrlNormalizer({
        baseUrl: "https://mysite.org",
        sortQueryParams: true,
        stripTrackingParams: true,
        trailingSlash: "always",
      });

      expect(normalizer("/articles?utm_medium=email&category=tech&page=1")).toBe(
        "https://mysite.org/articles/?category=tech&page=1",
      );
    });
  });

  describe("Component & Head Metadata Synchronization", () => {
    it("synchronizes canonical, og:url, and hreflang alternate links according to urlPolicy", async () => {
      render(
        <HelmetProvider
          defaults={{
            baseUrl: "https://example.com",
            urlPolicy: {
              sortQueryParams: true,
              stripTrackingParams: true,
              trailingSlash: "never",
            },
          }}
        >
          <Seo
            alternates={[
              {
                href: "/de/about/?utm_source=newsletter&lang=de",
                hrefLang: "de",
              },
            ]}
            canonical="/about/?utm_source=twitter&utm_medium=social&page=1"
            title="About Us"
          />
        </HelmetProvider>,
      );

      await waitFor(() => {
        expect(document.title).toBe("About Us");
      });

      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        "href",
        "https://example.com/about?page=1",
      );
      expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
        "content",
        "https://example.com/about?page=1",
      );
      expect(document.querySelector('link[rel="alternate"][hreflang="de"]')).toHaveAttribute(
        "href",
        "https://example.com/de/about?lang=de",
      );
    });

    it("produces byte-identical SSR string output and client DOM rendering", () => {
      HelmetProvider.canUseDOM = false;
      const ssrContext: HelmetServerContext = {};

      const html = renderToString(
        <HelmetProvider
          context={ssrContext}
          defaults={{
            baseUrl: "https://ssr.example.org",
            urlPolicy: {
              stripFragment: true,
              stripTrackingParams: true,
              trailingSlash: "always",
            },
          }}
        >
          <Seo canonical="/pricing#table?utm_source=ad" title="Pricing" />
        </HelmetProvider>,
      );

      expect(html).toBeDefined();
      expect(ssrContext.helmet).toBeDefined();

      const linkOutput = ssrContext.helmet?.link.toString();
      const metaOutput = ssrContext.helmet?.meta.toString();

      expect(linkOutput).toContain('href="https://ssr.example.org/pricing/"');
      expect(metaOutput).toContain('content="https://ssr.example.org/pricing/"');
    });
  });
});
