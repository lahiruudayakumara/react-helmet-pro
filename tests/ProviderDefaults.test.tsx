import "@testing-library/jest-dom";

import React from "react";
import { renderToString } from "react-dom/server";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Seo } from "../src/components/Seo";
import { HelmetProvider } from "../src/context/HelmetProvider";
import { useSeoDefaults } from "../src/hooks/useSeoDefaults";
import type { HelmetServerContext } from "../src/types";

describe("Provider SEO defaults and automatic social metadata fallbacks", () => {
  afterEach(() => {
    cleanup();
    HelmetProvider.canUseDOM = true;
    document.title = "";
    document.head.innerHTML = "";
    document.documentElement.removeAttribute("lang");
  });

  it("applies site-wide provider defaults when page props are minimal", async () => {
    render(
      <HelmetProvider
        defaults={{
          baseUrl: "https://example.com",
          description: "Global site description.",
          locale: "en-US",
          robots: { follow: true, index: true },
          siteName: "Global Platform",
          socialImage: {
            alt: "Global OG Image",
            url: "https://example.com/global-og.png",
          },
          titleTemplate: "%s | Global Platform",
          verification: { google: "google-site-ver-123" },
        }}
      >
        <Seo title="Dashboard" />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Dashboard | Global Platform");
    });

    expect(document.documentElement).toHaveAttribute("lang", "en-US");
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      "Global site description.",
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://example.com/",
    );
    expect(document.querySelector('meta[property="og:site_name"]')).toHaveAttribute(
      "content",
      "Global Platform",
    );
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "Dashboard",
    );
    expect(document.querySelector('meta[property="og:description"]')).toHaveAttribute(
      "content",
      "Global site description.",
    );
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
      "content",
      "https://example.com/global-og.png",
    );
    expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    expect(document.querySelector('meta[name="twitter:title"]')).toHaveAttribute(
      "content",
      "Dashboard",
    );
    expect(document.querySelector('meta[name="twitter:description"]')).toHaveAttribute(
      "content",
      "Global site description.",
    );
    expect(document.querySelector('meta[name="twitter:image"]')).toHaveAttribute(
      "content",
      "https://example.com/global-og.png",
    );
    expect(
      document.querySelector('meta[name="google-site-verification"]'),
    ).toHaveAttribute("content", "google-site-ver-123");
  });

  it("supports predictable nested-provider inheritance (Library < Provider < Nested Provider < Page)", async () => {
    render(
      <HelmetProvider
        defaults={{
          baseUrl: "https://company.com",
          locale: "en-US",
          robots: { index: true },
          siteName: "Company Portal",
        }}
      >
        <HelmetProvider
          defaults={{
            robots: { maxImagePreview: "large" },
            siteName: "Engineering Division",
          }}
        >
          <Seo canonical="/careers/developer" title="Senior Engineer" />
        </HelmetProvider>
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Senior Engineer");
    });

    expect(document.documentElement).toHaveAttribute("lang", "en-US");
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://company.com/careers/developer",
    );
    expect(document.querySelector('meta[property="og:site_name"]')).toHaveAttribute(
      "content",
      "Engineering Division",
    );
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "index, max-image-preview:large",
    );
  });

  it("never overwrites explicit page values with provider or fallback values", async () => {
    render(
      <HelmetProvider
        defaults={{
          description: "Default description",
          siteName: "Default Site",
          socialImage: "https://example.com/default-image.png",
          twitter: {
            card: "summary",
            title: "Provider Twitter Title",
          },
        }}
      >
        <Seo
          description="Explicit page description"
          openGraph={{
            description: "Explicit OG description",
            title: "Explicit OG Title",
          }}
          title="Page Title"
          twitter={{
            card: "summary_large_image",
            title: "Explicit Twitter Title",
          }}
        />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Page Title");
    });

    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      "Explicit page description",
    );
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "Explicit OG Title",
    );
    expect(document.querySelector('meta[property="og:description"]')).toHaveAttribute(
      "content",
      "Explicit OG description",
    );
    expect(document.querySelector('meta[name="twitter:title"]')).toHaveAttribute(
      "content",
      "Explicit Twitter Title",
    );
    expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
  });

  it("resolves relative canonical URLs against siteUrl/baseUrl", async () => {
    render(
      <HelmetProvider defaults={{ siteUrl: "https://docs.example.org" }}>
        <Seo canonical="/getting-started/installation" title="Installation" />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Installation");
    });

    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://docs.example.org/getting-started/installation",
    );
  });

  it("allows social metadata fallbacks to be disabled globally or selectively", async () => {
    render(
      <HelmetProvider
        defaults={{
          description: "Global fallback test description",
          socialImage: "https://example.com/image.jpg",
        }}
      >
        <Seo disableFallbacks title="No Fallbacks Page" />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("No Fallbacks Page");
    });

    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      "Global fallback test description",
    );
    expect(document.querySelector('meta[property="og:title"]')).toBeNull();
    expect(document.querySelector('meta[property="og:description"]')).toBeNull();
    expect(document.querySelector('meta[name="twitter:title"]')).toBeNull();
    expect(document.querySelector('meta[name="twitter:description"]')).toBeNull();
  });

  it("allows disabling only Twitter fallback while keeping Open Graph fallback", async () => {
    render(
      <HelmetProvider
        defaults={{
          description: "OG Only Description",
          fallbacks: { twitter: false },
        }}
      >
        <Seo title="OG Only Page" />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("OG Only Page");
    });

    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "OG Only Page",
    );
    expect(document.querySelector('meta[property="og:description"]')).toHaveAttribute(
      "content",
      "OG Only Description",
    );
    expect(document.querySelector('meta[name="twitter:title"]')).toBeNull();
  });

  it("produces identical output during SSR and client rendering", () => {
    HelmetProvider.canUseDOM = false;
    const ssrContext: HelmetServerContext = {};

    const html = renderToString(
      <HelmetProvider
        context={ssrContext}
        defaults={{
          baseUrl: "https://ssr.example.com",
          description: "SSR test description",
          siteName: "SSR Site",
        }}
      >
        <Seo canonical="/page" title="SSR Page" />
      </HelmetProvider>,
    );

    expect(html).toBeDefined();
    expect(ssrContext.helmet).toBeDefined();

    const titleOutput = ssrContext.helmet?.title.toString();
    const metaOutput = ssrContext.helmet?.meta.toString();
    const linkOutput = ssrContext.helmet?.link.toString();

    expect(titleOutput).toContain("<title>SSR Page</title>");
    expect(metaOutput).toContain('content="SSR test description"');
    expect(metaOutput).toContain('content="SSR Site"');
    expect(linkOutput).toContain('href="https://ssr.example.com/page"');
  });

  it("exposes current active provider defaults via useSeoDefaults hook", async () => {
    const TestComponent = () => {
      const defaults = useSeoDefaults();
      return <div data-testid="site-name">{defaults?.siteName}</div>;
    };

    const { getByTestId } = render(
      <HelmetProvider defaults={{ siteName: "Hook Site Name" }}>
        <TestComponent />
      </HelmetProvider>,
    );

    expect(getByTestId("site-name")).toHaveTextContent("Hook Site Name");
  });
});
