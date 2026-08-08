import { describe, expect, it } from "vitest";
import { toRemixHeaders, toRemixLinks, toRemixMeta } from "../src/remix";

describe("Remix Adapter", () => {
  it("converts Helmet state into Remix meta descriptors", () => {
    const meta = toRemixMeta({
      title: "Remix App",
      meta: [
        { name: "description", content: "Remix SEO" },
        { property: "og:type", content: "website" },
      ],
      script: [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "Remix App" }),
        },
      ],
    });

    expect(meta).toEqual([
      { title: "Remix App" },
      { name: "description", content: "Remix SEO" },
      { property: "og:type", content: "website" },
      { "script:ld+json": { "@context": "https://schema.org", "@type": "WebSite", name: "Remix App" } },
    ]);
  });

  it("converts link tags into Remix link descriptors", () => {
    const links = toRemixLinks({
      link: [
        { rel: "canonical", href: "https://example.com/remix" },
        { rel: "icon", href: "/favicon.ico" },
      ],
    });

    expect(links).toEqual([
      {
        rel: "canonical",
        href: "https://example.com/remix",
        as: undefined,
        crossOrigin: undefined,
        imageSizes: undefined,
        imageSrcSet: undefined,
        integrity: undefined,
        media: undefined,
        sizes: undefined,
        type: undefined,
      },
      {
        rel: "icon",
        href: "/favicon.ico",
        as: undefined,
        crossOrigin: undefined,
        imageSizes: undefined,
        imageSrcSet: undefined,
        integrity: undefined,
        media: undefined,
        sizes: undefined,
        type: undefined,
      },
    ]);
  });

  it("generates Remix headers with X-Robots-Tag", () => {
    const headers = toRemixHeaders(
      {
        meta: [{ name: "robots", content: "noindex, nofollow" }],
      },
      { "Cache-Control": "max-age=3600" },
    );

    expect(headers).toEqual({
      "Cache-Control": "max-age=3600",
      "X-Robots-Tag": "noindex, nofollow",
    });
  });
});
