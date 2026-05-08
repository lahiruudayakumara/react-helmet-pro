import "@testing-library/jest-dom";

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";

import { ArticleSeo } from "../src/components/ArticleSeo";
import { BreadcrumbJsonLd } from "../src/components/BreadcrumbJsonLd";
import { FAQJsonLd } from "../src/components/FAQJsonLd";
import { HelmetProvider } from "../src/context/HelmetProvider";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
} from "../src/utils/schemaBuilder";

describe("Rich result helpers", () => {
  afterEach(() => {
    cleanup();
    document.title = "";
    document.head.innerHTML = "";
    document.documentElement.removeAttribute("lang");
  });

  it("builds article, breadcrumb, and FAQ schemas", () => {
    const article = buildArticleSchema({
      authors: [
        "Jane Doe",
        {
          name: "John Smith",
          url: "https://example.com/authors/john-smith",
        },
      ],
      datePublished: "2026-05-01T12:00:00.000Z",
      headline: "Shipping SEO improvements",
      publisher: {
        logo: "https://example.com/logo.png",
        name: "React Helmet Pro",
      },
      type: "BlogPosting",
      url: "https://example.com/blog/shipping-seo-improvements",
    });

    const breadcrumb = buildBreadcrumbSchema([
      { item: "https://example.com", name: "Home" },
      { item: "https://example.com/blog", name: "Blog" },
    ]);

    const faq = buildFaqSchema([
      {
        answer: "Use ArticleSeo plus JSON-LD helpers.",
        question: "How do I improve article SEO?",
      },
    ]);

    expect(article).toMatchObject({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      author: [
        {
          "@type": "Person",
          name: "Jane Doe",
        },
        {
          "@type": "Person",
          name: "John Smith",
          url: "https://example.com/authors/john-smith",
        },
      ],
      headline: "Shipping SEO improvements",
      mainEntityOfPage: {
        "@id": "https://example.com/blog/shipping-seo-improvements",
        "@type": "WebPage",
      },
      publisher: {
        "@type": "Organization",
        logo: {
          "@type": "ImageObject",
          url: "https://example.com/logo.png",
        },
        name: "React Helmet Pro",
      },
    });

    expect(breadcrumb).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          item: "https://example.com",
          name: "Home",
          position: 1,
        },
        {
          "@type": "ListItem",
          item: "https://example.com/blog",
          name: "Blog",
          position: 2,
        },
      ],
    });

    expect(faq).toMatchObject({
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Use ArticleSeo plus JSON-LD helpers.",
          },
          name: "How do I improve article SEO?",
        },
      ],
    });
  });

  it("renders article SEO metadata and JSON-LD", async () => {
    render(
      <HelmetProvider>
        <ArticleSeo
          authors={[
            "Jane Doe",
            {
              name: "John Smith",
              url: "https://example.com/authors/john-smith",
            },
          ]}
          canonical="https://example.com/blog/shipping-seo-improvements"
          description="A practical guide to richer article SEO."
          images={[
            {
              alt: "Shipping SEO improvements",
              url: "https://example.com/og/article.png",
            },
          ]}
          keywords={["seo", "structured data", "react"]}
          locale="en-US"
          modifiedTime="2026-05-02T09:30:00.000Z"
          publishedTime="2026-05-01T12:00:00.000Z"
          publisher={{
            logo: "https://example.com/logo.png",
            name: "React Helmet Pro",
          }}
          schemaType="BlogPosting"
          section="Guides"
          tags={["SEO", "React"]}
          title="Shipping SEO improvements"
        />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Shipping SEO improvements");
    });

    expect(document.querySelector('meta[name="author"]')).toHaveAttribute(
      "content",
      "Jane Doe, John Smith",
    );
    expect(document.querySelector('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "article",
    );
    expect(document.querySelector('meta[property="article:published_time"]')).toHaveAttribute(
      "content",
      "2026-05-01T12:00:00.000Z",
    );
    expect(document.querySelector('meta[property="article:section"]')).toHaveAttribute(
      "content",
      "Guides",
    );
    expect(document.querySelector('meta[property="article:tag"]')).toHaveAttribute(
      "content",
      "SEO",
    );
    expect(document.querySelector('script[type="application/ld+json"]')?.textContent).toContain(
      '"@type":"BlogPosting"',
    );
    expect(document.querySelector('script[type="application/ld+json"]')?.textContent).toContain(
      '"headline":"Shipping SEO improvements"',
    );
  });

  it("renders breadcrumb and FAQ JSON-LD helpers", async () => {
    render(
      <>
        <BreadcrumbJsonLd
          items={[
            { item: "https://example.com", name: "Home" },
            { item: "https://example.com/docs", name: "Docs" },
            { item: "https://example.com/docs/seo", name: "SEO" },
          ]}
        />
        <FAQJsonLd
          entries={[
            {
              answer: "Add BreadcrumbJsonLd and FAQJsonLd to the page.",
              question: "How can I expose rich-result schema?",
            },
          ]}
        />
      </>,
    );

    await waitFor(() => {
      expect(document.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
    });

    const scripts = Array.from(
      document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
    ).map((element) => element.textContent ?? "");

    expect(scripts.join(" ")).toContain('"@type":"BreadcrumbList"');
    expect(scripts.join(" ")).toContain('"@type":"FAQPage"');
    expect(scripts.join(" ")).toContain('"name":"How can I expose rich-result schema?"');
  });
});
