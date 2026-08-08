import { describe, expect, it } from "vitest";
import plugin from "../src/eslint/index";
import requireTitle from "../src/eslint/rules/requireTitle";
import noDuplicateMeta from "../src/eslint/rules/noDuplicateMeta";
import safeJsonLd from "../src/eslint/rules/safeJsonLd";
import requireCanonical from "../src/eslint/rules/requireCanonical";

describe("ESLint plugin", () => {
  it("exports plugin with all 4 rules", () => {
    expect(plugin.rules).toHaveProperty("require-title");
    expect(plugin.rules).toHaveProperty("no-duplicate-meta");
    expect(plugin.rules).toHaveProperty("safe-json-ld");
    expect(plugin.rules).toHaveProperty("require-canonical");
  });

  it("has recommended and recommended-legacy configs", () => {
    expect(plugin.configs.recommended).toBeDefined();
    expect(Array.isArray(plugin.configs.recommended)).toBe(true);
    expect(plugin.configs["recommended-legacy"]).toBeDefined();
  });

  it("recommended config enables safe-json-ld as error", () => {
    const rules = (plugin.configs["recommended-legacy"] as { rules: Record<string, string> }).rules;
    expect(rules["react-helmet-pro/safe-json-ld"]).toBe("error");
  });

  it("recommended config enables require-title as warn", () => {
    const rules = (plugin.configs["recommended-legacy"] as { rules: Record<string, string> }).rules;
    expect(rules["react-helmet-pro/require-title"]).toBe("warn");
  });

  it("recommended config enables no-duplicate-meta as warn", () => {
    const rules = (plugin.configs["recommended-legacy"] as { rules: Record<string, string> }).rules;
    expect(rules["react-helmet-pro/no-duplicate-meta"]).toBe("warn");
  });

  it("recommended config sets require-canonical to off by default", () => {
    const rules = (plugin.configs["recommended-legacy"] as { rules: Record<string, string> }).rules;
    expect(rules["react-helmet-pro/require-canonical"]).toBe("off");
  });

  describe("require-title rule", () => {
    it("has correct meta type=suggestion and a missingTitle message", () => {
      expect(requireTitle.meta.type).toBe("suggestion");
      expect(requireTitle.meta.messages["missingTitle"]).toContain("title");
    });

    it("create() returns a JSXOpeningElement visitor", () => {
      const context = { report: () => {} };
      const visitors = requireTitle.create(context as never);
      expect(typeof visitors.JSXOpeningElement).toBe("function");
    });
  });

  describe("no-duplicate-meta rule", () => {
    it("has a duplicateMeta message with {{prop}} placeholder", () => {
      expect(noDuplicateMeta.meta.messages["duplicateMeta"]).toContain("{{prop}}");
    });

    it("create() returns a JSXAttribute visitor", () => {
      const context = { report: () => {} };
      const visitors = noDuplicateMeta.create(context as never);
      expect(typeof visitors.JSXAttribute).toBe("function");
    });
  });

  describe("safe-json-ld rule", () => {
    it("has type=problem (security-oriented)", () => {
      expect(safeJsonLd.meta.type).toBe("problem");
    });

    it("has unsafeInnerHtml and unsafeRawString messages", () => {
      expect(safeJsonLd.meta.messages["unsafeInnerHtml"]).toContain("safeJsonLdStringify");
      expect(safeJsonLd.meta.messages["unsafeRawString"]).toContain("safeJsonLdStringify");
    });

    it("create() returns JSXAttribute and JSXElement visitors", () => {
      const context = { report: () => {} };
      const visitors = safeJsonLd.create(context as never);
      expect(typeof visitors.JSXAttribute).toBe("function");
      expect(typeof visitors.JSXElement).toBe("function");
    });
  });

  describe("require-canonical rule", () => {
    it("has type=suggestion", () => {
      expect(requireCanonical.meta.type).toBe("suggestion");
    });

    it("has missingCanonical message with {{component}} placeholder", () => {
      expect(requireCanonical.meta.messages["missingCanonical"]).toContain("{{component}}");
    });

    it("create() returns a JSXOpeningElement visitor", () => {
      const context = { report: () => {} };
      const visitors = requireCanonical.create(context as never);
      expect(typeof visitors.JSXOpeningElement).toBe("function");
    });
  });
});
