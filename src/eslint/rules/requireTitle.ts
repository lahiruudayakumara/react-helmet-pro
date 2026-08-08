import type { Rule } from "./types";

/**
 * require-title
 *
 * Requires that every `<Helmet>` or high-level SEO component usage defines
 * a page `title` or `defaultTitle` prop.
 *
 * ✖ Bad:  <Helmet><meta name="description" content="..." /></Helmet>
 * ✓ Good: <Helmet title="My Page" />
 */
const requireTitleRule: Rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require a page title or defaultTitle prop on <Helmet> and SEO components",
      recommended: true,
      url: "https://github.com/opencorex-org/react-helmet-pro#eslint-require-title",
    },
    schema: [],
    messages: {
      missingTitle:
        "Missing `title` or `defaultTitle` prop. Every page should have a descriptive title for SEO.",
    },
  },
  create(context) {
    const SEO_COMPONENTS = new Set([
      "Helmet",
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

        const hasTitle = node.attributes.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (attr: any) =>
            attr.type === "JSXAttribute" &&
            attr.name.type === "JSXIdentifier" &&
            (attr.name.name === "title" || attr.name.name === "defaultTitle"),
        );

        if (!hasTitle) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          context.report({
            node: node as never,
            messageId: "missingTitle",
          });
        }
      },
    };
  },
};

export default requireTitleRule;
