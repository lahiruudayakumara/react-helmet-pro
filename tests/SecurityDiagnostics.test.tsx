import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import { Helmet } from "../src/components/Helmet";
import { Favicon } from "../src/components/Favicon";
import { Seo } from "../src/components/Seo";
import { HelmetProvider } from "../src/context/HelmetProvider";
import { HelmetData } from "../src/core/HelmetData";
import {
  auditHelmetState,
  isSafeSeoUrl,
} from "../src/core/auditHelmetState";
import {
  createEmptyState,
  normalizeHelmetProps,
  reduceHelmetInstances,
} from "../src/core/helmetState";
import { HELMET_SECURITY_RULE_IDS } from "../src/types";

describe("security diagnostics", () => {
  afterEach(() => {
    cleanup();
    document.head.innerHTML = "";
    HelmetProvider.canUseDOM = true;
  });

  it("detects mixed-case, encoded, and control-obfuscated dangerous schemes", () => {
    const state = createEmptyState();
    state.link = [
      { href: "JaVa%53cRiPt%3Aalert(1)", rel: "canonical" },
      { href: "java\u0000script:alert(2)", rel: "alternate" },
    ];
    state.meta = [
      {
        content: "0; url=java&#x73;cript&colon;alert(3)",
        httpEquiv: "ReFrEsH",
      },
    ];

    const result = auditHelmetState(state);

    expect(result.errors).toHaveLength(3);
    expect(result.errors.every(
      (diagnostic) =>
        diagnostic.id === HELMET_SECURITY_RULE_IDS.DANGEROUS_URL_SCHEME,
    )).toBe(true);
    expect(result.errors[0].source).toMatchObject({
      attribute: "href",
      tagIndex: 0,
      tagName: "link",
    });
    expect(result.valid).toBe(false);
  });

  it("classifies contextual URL forms without rewriting the state", () => {
    const state = createEmptyState();
    state.link = [
      { href: "data:image/png;base64,AAAA", rel: "icon" },
      { href: "//cdn.example.com/app.css", rel: "stylesheet" },
      { href: "mailto:security@example.com", rel: "canonical" },
    ];
    state.script = [{ src: "blob:https://example.com/id" }];
    state.meta = [
      { content: "web+demo:preview", property: "og:image" },
    ];

    const rawResult = auditHelmetState(state);
    const seoResult = auditHelmetState(state, { context: "seo" });

    expect(rawResult.diagnostics.map((diagnostic) => diagnostic.id)).toEqual([
      HELMET_SECURITY_RULE_IDS.DATA_URL,
      HELMET_SECURITY_RULE_IDS.PROTOCOL_RELATIVE_URL,
      HELMET_SECURITY_RULE_IDS.UNEXPECTED_URL_SCHEME,
      HELMET_SECURITY_RULE_IDS.BLOB_URL,
      HELMET_SECURITY_RULE_IDS.CUSTOM_URL_SCHEME,
    ]);
    expect(rawResult.warnings).toHaveLength(5);
    expect(seoResult.errors.map((diagnostic) => diagnostic.id)).toEqual([
      HELMET_SECURITY_RULE_IDS.DATA_URL,
      HELMET_SECURITY_RULE_IDS.UNEXPECTED_URL_SCHEME,
      HELMET_SECURITY_RULE_IDS.BLOB_URL,
      HELMET_SECURITY_RULE_IDS.CUSTOM_URL_SCHEME,
    ]);
    expect(state.link[0].href).toBe("data:image/png;base64,AAAA");
  });

  it("diagnoses string event handlers and suspicious attribute names", () => {
    const state = createEmptyState();
    state.htmlAttributes = {
      "bad name": "value",
      "on%6coad": "stealCookies()",
    };
    state.meta = [
      {
        content: "description",
        onClick: "run()",
      },
    ];

    const result = auditHelmetState(state);

    expect(result.errors.map((diagnostic) => diagnostic.id)).toEqual([
      HELMET_SECURITY_RULE_IDS.EVENT_HANDLER_ATTRIBUTE,
      HELMET_SECURITY_RULE_IDS.EVENT_HANDLER_ATTRIBUTE,
    ]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatchObject({
      id: HELMET_SECURITY_RULE_IDS.SUSPICIOUS_ATTRIBUTE_NAME,
      source: {
        attribute: "bad name",
        tagName: "htmlAttributes",
      },
    });
  });

  it("supports stable rule suppressions and severity overrides", () => {
    const state = createEmptyState();
    state.link = [
      { href: "//first.example.com", rel: "preconnect" },
      { href: "//second.example.com", rel: "preconnect" },
    ];
    state.script = [{ src: "data:text/javascript,alert(1)" }];

    expect(auditHelmetState(state).errors).toMatchObject([
      { id: HELMET_SECURITY_RULE_IDS.DATA_URL },
    ]);

    const result = auditHelmetState(state, {
      severities: {
        [HELMET_SECURITY_RULE_IDS.DATA_URL]: "suggestion",
      },
      suppressions: [
        {
          ruleId: HELMET_SECURITY_RULE_IDS.PROTOCOL_RELATIVE_URL,
          tagIndex: 0,
          tagName: "link",
        },
      ],
    });

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].source.tagIndex).toBe(1);
    expect(result.suggestions).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it("audits SSR-collected and client-compatible state identically", () => {
    HelmetProvider.canUseDOM = false;
    const helmetData = new HelmetData({});

    renderToString(
      <Helmet helmetData={helmetData}>
        <link rel="canonical" href="JAVASCRIPT:alert(1)" />
        <meta property="og:image" content="data:image/svg+xml,bad" />
      </Helmet>,
    );

    const ssrState = helmetData.getState();
    const clientCompatibleState = reduceHelmetInstances([
      {
        data: normalizeHelmetProps({
          link: [{ href: "JAVASCRIPT:alert(1)", rel: "canonical" }],
          meta: [{ content: "data:image/svg+xml,bad", property: "og:image" }],
        }),
        order: 1,
      },
    ]).state;

    expect(auditHelmetState(ssrState)).toEqual(
      auditHelmetState(clientCompatibleState),
    );
    expect(auditHelmetState(ssrState).diagnostics).toHaveLength(2);
    expect(helmetData.context.helmet?.link.toString()).toContain(
      "JAVASCRIPT:alert(1)",
    );
  });

  it("uses strict safe URL defaults in Seo while Helmet remains the raw escape hatch", async () => {
    render(
      <HelmetProvider>
        <Seo
          canonical="javascript:alert(1)"
          extraLink={[
            { href: "web+custom:asset", rel: "preload" },
            { href: "/safe-alternate", rel: "alternate" },
          ]}
          openGraph={{
            images: [{ url: "data:image/png;base64,AAAA" }],
            url: "vbscript:alert(2)",
          }}
          title="Safe defaults"
          twitter={{ images: ["blob:https://example.com/id"] }}
        />
        <Helmet link={[{ href: "javascript:rawEscapeHatch()", rel: "alternate" }]} />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Safe defaults");
    });

    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('meta[property="og:url"]')).toBeNull();
    expect(document.querySelector('meta[property="og:image"]')).toBeNull();
    expect(document.querySelector('meta[name="twitter:image"]')).toBeNull();
    expect(document.querySelector('link[href="web+custom:asset"]')).toBeNull();
    expect(document.querySelector('link[href="/safe-alternate"]')).not.toBeNull();
    expect(
      document.querySelector('link[href="javascript:rawEscapeHatch()"]'),
    ).not.toBeNull();
  });

  it("exposes the high-level URL predicate for custom helpers", () => {
    expect(isSafeSeoUrl("https://example.com")).toBe(true);
    expect(isSafeSeoUrl("/relative")).toBe(true);
    expect(isSafeSeoUrl("/relative", { requireAbsolute: true })).toBe(false);
    expect(isSafeSeoUrl("http://example.com", { requireHttps: true })).toBe(false);
    expect(isSafeSeoUrl("https://example.com", { requireHttps: true })).toBe(true);
    expect(isSafeSeoUrl("java%73cript%3Aalert(1)")).toBe(false);
  });

  it("applies the same safe default to the favicon helper", async () => {
    const { rerender } = render(<Favicon href="javascript:alert(1)" />);

    expect(document.querySelector('link[rel="icon"]')).toBeNull();

    rerender(<Favicon href="/favicon.ico" />);
    await waitFor(() => {
      expect(document.querySelector('link[rel="icon"]')).toHaveAttribute(
        "href",
        "/favicon.ico",
      );
    });
  });
});
