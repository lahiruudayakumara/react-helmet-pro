import type { Rule } from "./types";

/**
 * require-canonical
 *
 * Recommends that high-level SEO components define a `canonical` URL prop.
 * Canonical links prevent duplicate content penalties and consolidate page rank.
 *
 * ✖ Bad:  <SiteSeo title="My Page" description="..." />
 * ✓ Good: <SiteSeo title="My Page" canonical="https://example.com/page" />
 */
const requireCanonicalRule: Rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Recommend a canonical URL prop on high-level SEO components to prevent duplicate content",
      recommended: false,
      url: "https://github.com/opencorex-org/react-helmet-pro#eslint-require-canonical",
    },
    schema: [],
    messages: {
      missingCanonical:
        "Missing `canonical` prop on <{{component}}>. " +
        "A canonical URL consolidates page rank and prevents duplicate content penalties.",
    },
  },
  create(context) {
    const SEO_COMPONENTS = new Set([
      "SiteSeo",
      "ArticleSeo",
      "ProductSeo",
      "LocalBusinessSeo",
      "VideoSeo",
      "ImageSeo",
      "PaginationSeo",
      "PaywalledSeo",
    ]);

    return {
      JSXOpeningElement(node) {
        const componentName =
          node.name.type === "JSXIdentifier" ? node.name.name : null;
        if (!componentName || !SEO_COMPONENTS.has(componentName)) return;

        const hasCanonical = node.attributes.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (attr: any) =>
            attr.type === "JSXAttribute" &&
            attr.name.type === "JSXIdentifier" &&
            attr.name.name === "canonical",
        );

        if (!hasCanonical) {
          context.report({
            node: node as never,
            messageId: "missingCanonical",
            data: { component: componentName },
          });
        }
      },
    };
  },
};

export default requireCanonicalRule;
