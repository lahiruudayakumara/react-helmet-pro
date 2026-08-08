import { describe, expect, it } from "vitest";
import { createViteSsrStreamTransform, injectHelmetIntoHtml } from "../src/vite-ssr";

describe("Vite SSR Adapter", () => {
  it("injects head tags and html/body attributes into HTML template", () => {
    const template = `<!DOCTYPE html><html <!--helmet-html-attributes-->><head><!--helmet-head--></head><body <!--helmet-body-attributes-->><div>App</div></body></html>`;

    const result = injectHelmetIntoHtml(template, {
      title: "Vite App",
      htmlAttributes: { lang: "en" },
      bodyAttributes: { class: "app-body" },
      meta: [{ name: "description", content: "Vite SSR Helmet" }],
    });

    expect(result).toContain('<html lang="en">');
    expect(result).toContain('<body class="app-body">');
    expect(result).toContain("<title>Vite App</title>");
    expect(result).toContain('<meta name="description" content="Vite SSR Helmet" />');
  });

  it("injects before closing head tag when no placeholder is present", () => {
    const template = `<!DOCTYPE html><html><head><title>Old</title></head><body></body></html>`;

    const result = injectHelmetIntoHtml(template, {
      title: "New Title",
      meta: [{ name: "robots", content: "noindex" }],
    });

    expect(result).toContain("<title>New Title</title>");
    expect(result).toContain('<meta name="robots" content="noindex" />\n</head>');
  });

  it("transforms HTML stream using createViteSsrStreamTransform", async () => {
    const transform = createViteSsrStreamTransform({
      title: "Streamed Title",
    });

    const reader = transform.readable.getReader();
    const writer = transform.writable.getWriter();

    writer.write("<!DOCTYPE html><html><head><!--helmet-head-flush--></head><body>");
    writer.write("<div>Content</div></body></html>");
    writer.close();

    let output = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      output += value;
    }

    expect(output).toContain("<title>Streamed Title</title>");
    expect(output).not.toContain("<!--helmet-head-flush-->");
  });
});
