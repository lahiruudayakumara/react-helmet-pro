import type { Rule } from "./types";

/**
 * no-duplicate-meta
 *
 * Warns when the same single-value meta property is defined more than once
 * in a single `<Helmet>` or SEO component (e.g., two `description` props or
 * two items in `meta` array with the same `name`/`property`).
 *
 * ✖ Bad:
 *   <Helmet
 *     meta={[
 *       { name: "description", content: "A" },
 *       { name: "description", content: "B" },
 *     ]}
 *   />
 *
 * ✓ Good:
 *   <Helmet meta={[{ name: "description", content: "Only one" }]} />
 */

/** Meta properties that should only appear once per page. */
const SINGLETON_PROPS = new Set([
  "description",
  "og:title",
  "og:description",
  "og:url",
  "og:type",
  "og:site_name",
  "twitter:title",
  "twitter:description",
  "twitter:card",
  "robots",
  "viewport",
  "theme-color",
]);

const requireNoDuplicateMetaRule: Rule = {
  meta: {
    type: "warning" as unknown as "suggestion",
    docs: {
      description:
        "Warn on duplicate single-value meta properties in a single Helmet or SEO component",
      recommended: true,
      url: "https://github.com/opencorex-org/react-helmet-pro#eslint-no-duplicate-meta",
    },
    schema: [],
    messages: {
      duplicateMeta:
        "Duplicate meta property \"{{prop}}\". This property should only be defined once per page.",
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        // Look for `meta={[...]}` prop on Helmet/SEO components
        if (
          node.name.type !== "JSXIdentifier" ||
          node.name.name !== "meta" ||
          !node.value ||
          node.value.type !== "JSXExpressionContainer"
        ) {
          return;
        }

        const expr = node.value.expression;
        if (expr.type !== "ArrayExpression") return;

        const seen = new Map<string, number>();

        for (const element of expr.elements) {
          if (!element || element.type !== "ObjectExpression") continue;

          let nameOrProp: string | null = null;
          for (const prop of element.properties) {
            if (
              prop.type !== "Property" ||
              prop.key.type !== "Identifier"
            )
              continue;
            const keyName = prop.key.name;
            if (
              (keyName === "name" || keyName === "property") &&
              prop.value.type === "Literal" &&
              typeof prop.value.value === "string"
            ) {
              nameOrProp = prop.value.value;
            }
          }

          if (!nameOrProp || !SINGLETON_PROPS.has(nameOrProp)) continue;

          const count = (seen.get(nameOrProp) ?? 0) + 1;
          seen.set(nameOrProp, count);
          if (count > 1) {
            context.report({
              node: element as never,
              messageId: "duplicateMeta",
              data: { prop: nameOrProp },
            });
          }
        }
      },
    };
  },
};

export default requireNoDuplicateMetaRule;
