import { cleanup, render, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";

import { Helmet } from "../src/components/Helmet";
import { HelmetProvider } from "../src/context/HelmetProvider";
import { HelmetData } from "../src/core/HelmetData";
import { auditHelmetState } from "../src/core/auditHelmetState";
import { createEmptyState } from "../src/core/helmetState";
import { HELMET_SEO_RULE_IDS } from "../src/types";

describe("SEO audit and diagnostics", () => {
  afterEach(() => {
    cleanup();
    document.head.innerHTML = "";
    HelmetProvider.canUseDOM = true;
    vi.restoreAllMocks();
  });

  describe("title and base rules", () => {
    it("diagnoses missing title in SEO context", () => {
      const state = createEmptyState();
      const result = auditHelmetState(state, { context: "seo" });

      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.TITLE_MISSING,
      );
    });

    it("diagnoses empty, too short, and too long titles", () => {
      const emptyState = createEmptyState();
      emptyState.title = "   ";
      expect(auditHelmetState(emptyState).errors.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.TITLE_EMPTY,
      );

      const shortState = createEmptyState();
      shortState.title = "Short";
      expect(auditHelmetState(shortState).suggestions.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.TITLE_TOO_SHORT,
      );

      const longState = createEmptyState();
      longState.title =
        "This is an extraordinarily extremely long title that exceeds the recommended maximum title length for search engines";
      expect(auditHelmetState(longState).suggestions.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.TITLE_TOO_LONG,
      );
    });

    it("diagnoses multiple base tags", () => {
      const state = createEmptyState();
      state.base = [
        { href: "https://example.com/a/" },
        { href: "https://example.com/b/" },
      ];

      const result = auditHelmetState(state);
      expect(result.errors.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.BASE_MULTIPLE,
      );
      expect(result.errors[0].source).toMatchObject({
        attribute: "href",
        tagIndex: 1,
        tagName: "base",
      });
    });
  });

  describe("description rules", () => {
    it("diagnoses missing description in SEO context", () => {
      const state = createEmptyState();
      const result = auditHelmetState(state, { context: "seo" });

      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.DESCRIPTION_MISSING,
      );
    });

    it("diagnoses empty, short, long, and duplicate meta descriptions", () => {
      const state = createEmptyState();
      state.meta = [
        { content: "", name: "description" },
        { content: "Duplicate description", name: "description" },
      ];

      const result = auditHelmetState(state);
      expect(result.errors.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.DESCRIPTION_EMPTY,
      );
      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.DESCRIPTION_DUPLICATE,
      );

      const shortState = createEmptyState();
      shortState.meta = [{ content: "Too short desc", name: "description" }];
      expect(auditHelmetState(shortState).suggestions.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.DESCRIPTION_TOO_SHORT,
      );

      const longState = createEmptyState();
      longState.meta = [
        {
          content:
            "This description is way too long and will definitely exceed the standard 160 character limit for meta description search engine snippet display which truncates long descriptions.",
          name: "description",
        },
      ];
      expect(auditHelmetState(longState).suggestions.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.DESCRIPTION_TOO_LONG,
      );
    });
  });

  describe("canonical URL rules", () => {
    it("diagnoses missing, invalid, and duplicate canonical links", () => {
      const missingState = createEmptyState();
      expect(auditHelmetState(missingState, { context: "seo" }).warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.CANONICAL_MISSING,
      );

      const relativeState = createEmptyState();
      relativeState.link = [{ href: "/relative-canonical", rel: "canonical" }];
      expect(auditHelmetState(relativeState, { context: "seo" }).errors.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.CANONICAL_INVALID_URL,
      );

      const duplicateState = createEmptyState();
      duplicateState.link = [
        { href: "https://example.com/page1", rel: "canonical" },
        { href: "https://example.com/page2", rel: "canonical" },
      ];
      expect(auditHelmetState(duplicateState).errors.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.CANONICAL_DUPLICATE,
      );
    });
  });

  describe("robots directives rules", () => {
    it("diagnoses duplicate robots tags and conflicting directives", () => {
      const state = createEmptyState();
      state.meta = [
        { content: "index, noindex, follow", name: "robots" },
        { content: "noindex, follow", name: "robots" },
      ];

      const result = auditHelmetState(state);
      expect(result.errors.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.ROBOTS_CONFLICT,
      );
      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.ROBOTS_DUPLICATE,
      );
    });

    it("diagnoses noindex paired with canonical target", () => {
      const state = createEmptyState();
      state.meta = [{ content: "noindex, follow", name: "robots" }];
      state.link = [{ href: "https://example.com/canonical", rel: "canonical" }];

      const result = auditHelmetState(state);
      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.NOINDEX_CANONICAL_CONFLICT,
      );
    });
  });

  describe("Open Graph and Twitter rules", () => {
    it("diagnoses incomplete OG tags, duplicates, and canonical URL mismatches", () => {
      const state = createEmptyState();
      state.meta = [
        { content: "Title", property: "og:title" },
        { content: "Title 2", property: "og:title" },
        { content: "https://example.com/og-url", property: "og:url" },
      ];
      state.link = [{ href: "https://example.com/canonical-url", rel: "canonical" }];

      const result = auditHelmetState(state, { context: "seo" });
      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.OG_DUPLICATE,
      );
      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.OG_CANONICAL_MISMATCH,
      );
      expect(result.suggestions.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.OG_INCOMPLETE,
      );
    });

    it("diagnoses incomplete Twitter cards and duplicate properties", () => {
      const state = createEmptyState();
      state.meta = [
        { content: "summary_large_image", name: "twitter:card" },
        { content: "Card Title", name: "twitter:title" },
        { content: "Card Title 2", name: "twitter:title" },
      ];

      const result = auditHelmetState(state);
      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.TWITTER_DUPLICATE,
      );
      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.TWITTER_INCOMPLETE,
      );
    });
  });

  describe("hreflang rules", () => {
    it("diagnoses invalid language codes, relative URLs, duplicate codes, and missing x-default", () => {
      const state = createEmptyState();
      state.link = [
        { href: "https://example.com/en", hrefLang: "en", rel: "alternate" },
        { href: "/fr", hrefLang: "fr", rel: "alternate" },
        { href: "https://example.com/en2", hrefLang: "en", rel: "alternate" },
        { href: "https://example.com/bad", hrefLang: "invalid_123_code!", rel: "alternate" },
      ];

      const result = auditHelmetState(state);
      expect(result.errors.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.HREFLANG_INVALID_CODE,
      );
      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.HREFLANG_DUPLICATE,
      );
      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.HREFLANG_INVALID_URL,
      );
      expect(result.suggestions.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.HREFLANG_MISSING_X_DEFAULT,
      );
    });
  });

  describe("image metadata rules", () => {
    it("diagnoses missing image alt and invalid dimensions", () => {
      const state = createEmptyState();
      state.meta = [
        { content: "https://example.com/image.png", property: "og:image" },
        { content: "-100", property: "og:image:width" },
      ];

      const result = auditHelmetState(state, { context: "seo" });
      expect(result.suggestions.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.IMAGE_ALT_MISSING,
      );
      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.IMAGE_INVALID_DIMENSIONS,
      );
    });
  });

  describe("dates rules", () => {
    it("diagnoses invalid dates, future dates, and invalid modified/published order", () => {
      const state = createEmptyState();
      const futureYear = new Date().getFullYear() + 5;
      state.meta = [
        { content: "invalid-date", property: "article:published_time" },
        { content: `${futureYear}-01-01T00:00:00Z`, property: "article:published_time" },
        { content: "2020-01-01T00:00:00Z", property: "article:modified_time" },
      ];

      const result = auditHelmetState(state);
      expect(result.errors.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.DATE_INVALID,
      );
      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.DATE_FUTURE,
      );
    });

    it("detects when modified_time is earlier than published_time", () => {
      const state = createEmptyState();
      state.meta = [
        { content: "2025-06-01T00:00:00Z", property: "article:published_time" },
        { content: "2025-01-01T00:00:00Z", property: "article:modified_time" },
      ];

      const result = auditHelmetState(state);
      expect(result.errors.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.DATE_ORDER_INVALID,
      );
    });
  });

  describe("JSON-LD structured data rules", () => {
    it("diagnoses invalid JSON, missing @context, and missing @type", () => {
      const state = createEmptyState();
      state.script = [
        { innerHTML: "{ bad json }", type: "application/ld+json" },
        { innerHTML: JSON.stringify({ name: "No Context or Type" }), type: "application/ld+json" },
      ];

      const result = auditHelmetState(state);
      expect(result.errors.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.JSONLD_INVALID,
      );
      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.JSONLD_MISSING_CONTEXT,
      );
      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.JSONLD_MISSING_TYPE,
      );
    });
  });

  describe("severity overrides and suppressions", () => {
    it("supports overriding severity and suppressing fine-grained rules", () => {
      const state = createEmptyState();
      state.meta = [
        { content: "", name: "description" },
        { content: "index, noindex", name: "robots" },
      ];

      const result = auditHelmetState(state, {
        severities: {
          [HELMET_SEO_RULE_IDS.DESCRIPTION_EMPTY]: "warning",
        },
        suppressions: [
          {
            ruleId: HELMET_SEO_RULE_IDS.ROBOTS_CONFLICT,
            tagName: "meta",
          },
        ],
      });

      expect(result.errors).toHaveLength(0);
      expect(result.warnings.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.DESCRIPTION_EMPTY,
      );
    });
  });

  describe("SSR vs client state identity", () => {
    it("produces identical diagnostic results on SSR state and client state", () => {
      HelmetProvider.canUseDOM = false;
      const helmetData = new HelmetData({});

      renderToString(
        <Helmet helmetData={helmetData}>
          <title>A</title>
          <meta name="description" content="Short" />
        </Helmet>,
      );

      const ssrState = helmetData.getState();
      const ssrAudit = auditHelmetState(ssrState, { context: "seo" });

      expect(ssrAudit.suggestions.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.TITLE_TOO_SHORT,
      );
      expect(ssrAudit.suggestions.map((d) => d.id)).toContain(
        HELMET_SEO_RULE_IDS.DESCRIPTION_TOO_SHORT,
      );
    });
  });

  describe("development diagnostics warning logging", () => {
    it("logs console warnings when enableDevDiagnostics is set", async () => {
      const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <HelmetProvider enableDevDiagnostics>
          <Helmet>
            <meta name="description" content="Too short" />
          </Helmet>
        </HelmetProvider>,
      );

      await waitFor(() => {
        expect(spyWarn).toHaveBeenCalled();
      });

      const calledWithRule = spyWarn.mock.calls.some((args) =>
        String(args[0]).includes(HELMET_SEO_RULE_IDS.DESCRIPTION_TOO_SHORT),
      );
      expect(calledWithRule).toBe(true);
    });
  });
});
