import { describe, expect, it, vi } from "vitest";

import {
  buildIndexNowPayload,
  buildRobotsTxt,
  buildSitemapIndexXml,
  buildSitemapXml,
  chunkSitemapUrls,
  createRobotsTxtRouteHandler,
  createSitemapRouteHandler,
  escapeXml,
  isProductionRobotsBlocking,
  submitIndexNowPayload,
} from "../src/generators";
import type { SitemapUrl } from "../src/types/sitemap";

describe("Sitemap, robots.txt, and indexing route generators", () => {
  describe("Sitemap XML & Extensions", () => {
    it("escapes XML special characters", () => {
      expect(escapeXml("Tom & Jerry <5> \"quote'")).toBe(
        "Tom &amp; Jerry &lt;5&gt; &quot;quote&apos;",
      );
    });

    it("generates standards-compliant sitemap XML with conditional extension namespaces", () => {
      const urls: SitemapUrl[] = [
        {
          alternates: [{ href: "https://example.com/fr", hrefLang: "fr" }],
          changefreq: "daily",
          images: [{ caption: "Widget View & Angle", title: "Widget", url: "https://example.com/img.jpg" }],
          lastmod: "2026-07-29",
          loc: "https://example.com/product?id=1&name=widget",
          news: {
            publication: { language: "en", name: "Daily News" },
            publicationDate: "2026-07-29",
            title: "News Headline & Impact",
          },
          priority: 0.8,
          videos: [{ description: "Demo video", thumbnailUrl: "https://example.com/thumb.jpg", title: "Demo" }],
        },
      ];

      const xml = buildSitemapXml(urls);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
      expect(xml).toContain('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"');
      expect(xml).toContain('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
      expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
      expect(xml).toContain("<loc>https://example.com/product?id=1&amp;name=widget</loc>");
      expect(xml).toContain("<priority>0.8</priority>");
      expect(xml).toContain("<image:title>Widget</image:title>");
    });

    it("chunks large sitemap arrays according to protocol limit (max 50,000 URLs)", () => {
      const dummyUrls: SitemapUrl[] = Array.from({ length: 120000 }, (_, i) => ({
        loc: `https://example.com/page-${i}`,
      }));

      const chunks = chunkSitemapUrls(dummyUrls, 50000);
      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toHaveLength(50000);
      expect(chunks[1]).toHaveLength(50000);
      expect(chunks[2]).toHaveLength(20000);
    });

    it("generates sitemap index XML", () => {
      const indexXml = buildSitemapIndexXml([
        { loc: "https://example.com/sitemap-1.xml" },
        { loc: "https://example.com/sitemap-2.xml" },
      ]);

      expect(indexXml).toContain("<sitemapindex");
      expect(indexXml).toContain("<loc>https://example.com/sitemap-1.xml</loc>");
    });
  });

  describe("Robots.txt Builder & Safety Checks", () => {
    it("generates predictable multi-agent robots.txt content", () => {
      const robots = buildRobotsTxt({
        host: "https://example.com",
        rules: [
          { allow: "/", disallow: ["/admin", "/private"], userAgent: "*" },
          { crawlDelay: 10, disallow: "/", userAgent: "GPTBot" },
        ],
        sitemaps: ["https://example.com/sitemap.xml"],
      });

      expect(robots).toContain("User-agent: *");
      expect(robots).toContain("Disallow: /admin");
      expect(robots).toContain("User-agent: GPTBot");
      expect(robots).toContain("Crawl-delay: 10");
      expect(robots).toContain("Host: https://example.com");
      expect(robots).toContain("Sitemap: https://example.com/sitemap.xml");
    });

    it("audits accidental production blocking configuration in robots.txt", () => {
      const blockingRobots = `
User-agent: *
Disallow: /
`;
      const safeRobots = `
User-agent: *
Allow: /
Disallow: /admin
`;

      expect(isProductionRobotsBlocking(blockingRobots)).toBe(true);
      expect(isProductionRobotsBlocking(safeRobots)).toBe(false);
    });
  });

  describe("IndexNow Builder & Adapter", () => {
    it("builds and validates IndexNow payload", () => {
      const payload = buildIndexNowPayload({
        host: "example.com",
        key: "1234567890abcdef",
        urlList: ["https://example.com/page-1"],
      });

      expect(payload.host).toBe("example.com");
      expect(payload.key).toBe("1234567890abcdef");
      expect(payload.urlList).toHaveLength(1);

      expect(() =>
        buildIndexNowPayload({
          host: "example.com",
          key: "key",
          urlList: Array.from({ length: 10001 }, () => "url"),
        }),
      ).toThrow("exceeds maximum limit");
    });

    it("submits IndexNow payload via fetch adapter", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await submitIndexNowPayload({
        host: "example.com",
        key: "key123",
        urlList: ["https://example.com/updated"],
      });

      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.indexnow.org/indexnow",
        expect.objectContaining({
          method: "POST",
        }),
      );

      vi.unstubAllGlobals();
    });
  });

  describe("Server Route Handler Adapters", () => {
    it("creates Web standard Response handlers for Next.js / server runtimes", async () => {
      const sitemapHandler = createSitemapRouteHandler([
        { loc: "https://example.com/home" },
      ]);

      const response = sitemapHandler();
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("application/xml");

      const body = await response.text();
      expect(body).toContain("<loc>https://example.com/home</loc>");

      const robotsHandler = createRobotsTxtRouteHandler({
        rules: [{ allow: "/", userAgent: "*" }],
      });

      const robotsResponse = robotsHandler();
      expect(robotsResponse.headers.get("Content-Type")).toContain("text/plain");
    });
  });
});
