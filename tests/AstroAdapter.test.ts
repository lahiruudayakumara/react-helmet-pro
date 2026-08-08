import { describe, expect, it } from "vitest";
import { collectAstroHead, getAstroRobotsHeader, renderAstroHeadToString } from "../src/astro";

describe("Astro Adapter", () => {
  it("collects Astro head structured collections", () => {
    const head = collectAstroHead({
      title: "Astro Page",
      htmlAttributes: { lang: "en" },
      bodyAttributes: { class: "dark" },
      meta: [{ name: "description", content: "Astro SEO" }],
      link: [{ rel: "canonical", href: "https://example.com/astro" }],
    });

    expect(head.title).toBe("Astro Page");
    expect(head.htmlAttributes).toEqual({ lang: "en" });
    expect(head.bodyAttributes).toEqual({ class: "dark" });
    expect(head.meta).toEqual([{ name: "description", content: "Astro SEO" }]);
    expect(head.link).toEqual([{ rel: "canonical", href: "https://example.com/astro" }]);
  });

  it("renders Astro head elements to string", () => {
    const htmlStr = renderAstroHeadToString({
      title: "Astro Title",
      meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
      link: [{ rel: "icon", href: "/favicon.ico" }],
      style: [{ cssText: "body { margin: 0; }" }],
      script: [{ innerHTML: "console.log('astro')" }],
    });

    expect(htmlStr).toContain("<title>Astro Title</title>");
    expect(htmlStr).toContain('<meta name="viewport" content="width=device-width, initial-scale=1" />');
    expect(htmlStr).toContain('<link rel="icon" href="/favicon.ico" />');
    expect(htmlStr).toContain("<style>body { margin: 0; }</style>");
    expect(htmlStr).toContain("<script>console.log('astro')</script>");
  });

  it("extracts Astro robots header", () => {
    const headers = getAstroRobotsHeader({ index: false, follow: true });
    expect(headers).toEqual({ "X-Robots-Tag": "noindex, follow" });
  });
});
