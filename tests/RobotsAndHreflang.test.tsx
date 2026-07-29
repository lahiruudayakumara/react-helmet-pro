import "@testing-library/jest-dom";

import React from "react";
import { renderToString } from "react-dom/server";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LocalizedSeo } from "../src/components/LocalizedSeo";
import { Seo } from "../src/components/Seo";
import { HelmetProvider } from "../src/context/HelmetProvider";
import type { HelmetServerContext } from "../src/types";
import { ROBOTS_PRESETS } from "../src/types/robots";
import { buildHreflangLinks, normalizeLocaleCode } from "../src/utils/localeNormalizer";
import { buildRobotsString, buildXRobotsTagHeader, buildXRobotsTagHeaderString } from "../src/utils/robotsBuilder";

describe("Advanced robots directives and hreflang management", () => {
  afterEach(() => {
    cleanup();
    HelmetProvider.canUseDOM = true;
    document.title = "";
    document.head.innerHTML = "";
    document.documentElement.removeAttribute("lang");
  });

  describe("Robots Presets & HTTP Header Serialization", () => {
    it("exports ROBOTS_PRESETS for standard crawler configurations", () => {
      expect(ROBOTS_PRESETS.INDEX_FOLLOW).toEqual({ follow: true, index: true });
      expect(ROBOTS_PRESETS.NOINDEX_NOFOLLOW).toEqual({ follow: false, index: false });
      expect(ROBOTS_PRESETS.PRIVATE).toEqual({
        follow: false,
        index: false,
        noarchive: true,
        nocache: true,
        nosnippet: true,
      });
    });

    it("serializes robots rules into string with backward-compatible deprecated directives", () => {
      const robotsStr = buildRobotsString({
        follow: true,
        index: false,
        maxImagePreview: "large",
        noodp: true,
        noydir: true,
      });

      expect(robotsStr).toBe("noindex, follow, noodp, noydir, max-image-preview:large");
    });

    it("builds X-Robots-Tag HTTP response headers for SSR servers", () => {
      const headerObj = buildXRobotsTagHeader({
        ...ROBOTS_PRESETS.INDEX_FOLLOW,
        googleBot: { maxImagePreview: "large", maxSnippet: 160 },
        googleBotNews: { index: false },
      });

      expect(headerObj).toEqual({
        "X-Robots-Tag": "index, follow, googlebot: max-image-preview:large, max-snippet:160, googlebot-news: noindex",
      });

      const headerString = buildXRobotsTagHeaderString({
        customCrawlers: {
          GPTBot: { index: false },
        },
        index: true,
      });

      expect(headerString).toBe("index, gptbot: noindex");
    });
  });

  describe("Locale Normalization & Hreflang Management", () => {
    it("normalizes locale codes to BCP 47 standard format", () => {
      expect(normalizeLocaleCode("en_US")).toBe("en-US");
      expect(normalizeLocaleCode("FR_fr")).toBe("fr-FR");
      expect(normalizeLocaleCode("zh_hans_cn")).toBe("zh-Hans-CN");
      expect(normalizeLocaleCode("x-default")).toBe("x-default");
    });

    it("builds deterministically sorted hreflang alternate links with x-default", () => {
      const links = buildHreflangLinks(
        {
          "fr-FR": "https://example.com/fr",
          "en-US": "https://example.com/en",
          "de-DE": "https://example.com/de",
        },
        {
          autoXDefault: true,
          currentLocale: "en-US",
        },
      );

      // Links should be sorted deterministically by hrefLang code: de-DE, en-US, fr-FR, x-default
      expect(links.map((l) => l.hrefLang)).toEqual(["de-DE", "en-US", "fr-FR", "x-default"]);
      expect(links.find((l) => l.hrefLang === "x-default")?.href).toBe("https://example.com/en");
    });
  });

  describe("LocalizedSeo Component", () => {
    it("renders internationalized SEO head metadata with language maps and hreflang links", async () => {
      render(
        <HelmetProvider
          defaults={{
            baseUrl: "https://example.com",
            urlPolicy: { trailingSlash: "never" },
          }}
        >
          <LocalizedSeo
            currentLocale="fr-FR"
            descriptionMap={{
              "en-US": "English Description",
              "fr-FR": "Description en Français",
            }}
            locales={{
              "de-DE": "/de/accueil",
              "en-US": "/en/home",
              "fr-FR": "/fr/accueil",
            }}
            mediaAlternates={[
              {
                href: "/fr/accueil.pdf",
                media: "print",
                type: "application/pdf",
              },
            ]}
            titleMap={{
              "en-US": "Home Page",
              "fr-FR": "Page d'accueil",
            }}
          />
        </HelmetProvider>,
      );

      await waitFor(() => {
        expect(document.title).toBe("Page d'accueil");
      });

      expect(document.documentElement).toHaveAttribute("lang", "fr-FR");
      expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
        "content",
        "Description en Français",
      );
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        "href",
        "https://example.com/fr/accueil",
      );

      const hreflangs = Array.from(
        document.querySelectorAll('link[rel="alternate"][hreflang]'),
      ).map((el) => ({
        href: el.getAttribute("href"),
        hreflang: el.getAttribute("hreflang"),
      }));

      expect(hreflangs).toEqual([
        { href: "https://example.com/de/accueil", hreflang: "de-DE" },
        { href: "https://example.com/en/home", hreflang: "en-US" },
        { href: "https://example.com/fr/accueil", hreflang: "fr-FR" },
        { href: "https://example.com/fr/accueil", hreflang: "x-default" },
      ]);
    });

    it("renders byte-identical output during SSR", () => {
      HelmetProvider.canUseDOM = false;
      const ssrContext: HelmetServerContext = {};

      const html = renderToString(
        <HelmetProvider context={ssrContext}>
          <Seo
            robots={{
              follow: true,
              googleBot: { maxImagePreview: "large" },
              index: true,
            }}
            title="SSR Robots Page"
          />
        </HelmetProvider>,
      );

      expect(html).toBeDefined();
      expect(ssrContext.helmet).toBeDefined();

      const metaOutput = ssrContext.helmet?.meta.toString();
      expect(metaOutput).toContain('content="index, follow"');
      expect(metaOutput).toContain('name="robots"');
      expect(metaOutput).toContain('content="max-image-preview:large"');
      expect(metaOutput).toContain('name="googlebot"');
    });
  });
});
