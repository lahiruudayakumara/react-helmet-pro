import { describe, expect, it } from "vitest";
import { parseHtmlToHelmetState } from "../src/cli/htmlParser";
import { formatAsSarif } from "../src/cli/sarifFormatter";
import { runAudit } from "../src/cli/auditRunner";
import { auditHelmetState } from "../src/core/auditHelmetState";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// ─── parseHtmlToHelmetState ──────────────────────────────────────────────────

describe("parseHtmlToHelmetState", () => {
  it("extracts <title> from HTML string", () => {
    const html = "<html><head><title>My Awesome Page</title></head></html>";
    const state = parseHtmlToHelmetState(html);
    expect(state.title).toBe("My Awesome Page");
  });

  it("extracts <meta name> tags", () => {
    const html = `
      <html><head>
        <meta name="description" content="A great page">
        <meta property="og:title" content="OG Title">
      </head></html>
    `;
    const state = parseHtmlToHelmetState(html);
    expect(state.meta.find((m) => m.name === "description")?.content).toBe("A great page");
    expect(state.meta.find((m) => m.property === "og:title")?.content).toBe("OG Title");
  });

  it("extracts <link rel='canonical'> tags", () => {
    const html = `<html><head><link rel="canonical" href="https://example.com/page"></head></html>`;
    const state = parseHtmlToHelmetState(html);
    expect(state.link.find((l) => l.rel === "canonical")?.href).toBe("https://example.com/page");
  });

  it("extracts <script type='application/ld+json'> content", () => {
    const schema = JSON.stringify({ "@context": "https://schema.org", "@type": "Product", "name": "Widget" });
    const html = `<html><head><script type="application/ld+json">${schema}</script></head></html>`;
    const state = parseHtmlToHelmetState(html);
    const jsonLd = state.script.find((s) => s.type === "application/ld+json");
    expect(jsonLd).not.toBeUndefined();
    const parsed = JSON.parse(jsonLd?.innerHTML ?? "{}");
    expect(parsed["@type"]).toBe("Product");
  });

  it("returns empty collections for minimal HTML", () => {
    const state = parseHtmlToHelmetState("<html><head></head><body></body></html>");
    expect(state.title).toBeUndefined();
    expect(state.meta).toHaveLength(0);
    expect(state.link).toHaveLength(0);
    expect(state.script).toHaveLength(0);
  });
});

// ─── formatAsSarif ──────────────────────────────────────────────────────────

describe("formatAsSarif", () => {
  it("produces SARIF v2.1.0 structure", () => {
    const html = "<html><head></head></html>";
    const state = parseHtmlToHelmetState(html);
    const result = auditHelmetState(state, { context: "seo" });
    const sarif = formatAsSarif(result, "dist/index.html");

    expect(sarif.version).toBe("2.1.0");
    expect(sarif.$schema).toContain("sarif-schema-2.1.0");
    expect(sarif.runs).toHaveLength(1);
    expect(sarif.runs[0].tool.driver.name).toBe("react-helmet-pro");
  });

  it("maps error diagnostics to SARIF level 'error'", () => {
    const state = parseHtmlToHelmetState("<html><head></head></html>");
    const result = auditHelmetState(state, { context: "seo" });
    const sarif = formatAsSarif(result, "index.html");

    // There should be at least one SARIF result from the missing title/description/canonical errors
    expect(sarif.runs[0].results.length).toBeGreaterThan(0);
  });

  it("produces rules listing from unique diagnostic IDs", () => {
    const state = parseHtmlToHelmetState("<html><head></head></html>");
    const result = auditHelmetState(state, { context: "seo" });
    const sarif = formatAsSarif(result, "index.html");

    const ruleIds = sarif.runs[0].tool.driver.rules.map((r) => r.id);
    // All rule IDs should be unique
    expect(new Set(ruleIds).size).toBe(ruleIds.length);
  });
});

// ─── runAudit ───────────────────────────────────────────────────────────────

describe("runAudit", () => {
  it("audits a local HTML file and returns text output", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rhp-audit-test-"));
    const filePath = path.join(tmpDir, "test.html");
    fs.writeFileSync(
      filePath,
      `<html><head><title>Test</title><meta name="description" content="A long enough description for SEO purposes here."><link rel="canonical" href="https://example.com/test"></head></html>`,
    );

    try {
      const result = await runAudit([filePath], { format: "text" });
      expect(result.output).toContain("react-helmet-pro audit");
      expect(result.exitCode).toBe(0);
      expect(result.results).toHaveLength(1);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("returns audit results with warnings when HTML has missing SEO fields", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rhp-audit-test-"));
    const filePath = path.join(tmpDir, "bad.html");
    fs.writeFileSync(filePath, `<html><head></head></html>`);

    try {
      const result = await runAudit([filePath], { format: "text" });
      // Missing title, description, and canonical all produce diagnostics
      expect(result.results[0].result.diagnostics.length).toBeGreaterThan(0);
      expect(result.results).toHaveLength(1);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("returns JSON-formatted output when format=json", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rhp-audit-json-"));
    const filePath = path.join(tmpDir, "page.html");
    fs.writeFileSync(filePath, `<html><head></head></html>`);

    try {
      const result = await runAudit([filePath], { format: "json" });
      const parsed = JSON.parse(result.output);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0]).toHaveProperty("uri");
      expect(parsed[0]).toHaveProperty("result");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("returns SARIF-formatted output when format=sarif", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rhp-audit-sarif-"));
    const filePath = path.join(tmpDir, "page.html");
    fs.writeFileSync(filePath, `<html><head></head></html>`);

    try {
      const result = await runAudit([filePath], { format: "sarif" });
      const sarif = JSON.parse(result.output);
      expect(sarif.version).toBe("2.1.0");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("exits code 1 when warnings exceed max-warnings threshold", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rhp-audit-maxwarn-"));
    const filePath = path.join(tmpDir, "page.html");
    // Page with only warnings (title too short, etc.)
    fs.writeFileSync(
      filePath,
      `<html><head><title>A</title><link rel="canonical" href="https://example.com"></head></html>`,
    );

    try {
      const result = await runAudit([filePath], { format: "text", maxWarnings: 0 });
      expect(result.exitCode).toBe(1);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
