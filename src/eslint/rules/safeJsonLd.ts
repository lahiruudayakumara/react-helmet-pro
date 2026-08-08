import type { Rule } from "./types";

/**
 * safe-json-ld
 *
 * Disallows raw string interpolation in `<script type="application/ld+json">` tags.
 * Enforces use of `safeJsonLdStringify()` or the structured data components
 * (e.g., `<JsonLd>`, `<ProductSeo>`, `<StructuredData>`) to prevent XSS injection.
 *
 * ✖ Bad:
 *   <script type="application/ld+json">
 *     {`{ "@type": "Product", "name": "${userInput}" }`}
 *   </script>
 *
 *   <Helmet script={[{ type: "application/ld+json", innerHTML: `{ "name": "${name}" }` }]} />
 *
 * ✓ Good:
 *   import { safeJsonLdStringify } from 'react-helmet-pro';
 *   <script type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(schema) }}
 *   />
 *
 *   <ProductSeo schema={schema} />
 */
const safeJsonLdRule: Rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce safe JSON-LD serialization to prevent XSS injection in structured data scripts",
      recommended: true,
      url: "https://github.com/opencorex-org/react-helmet-pro#eslint-safe-json-ld",
    },
    schema: [],
    messages: {
      unsafeInnerHtml:
        "Unsafe JSON-LD: innerHTML uses a template literal with possible variable interpolation. " +
        "Use `safeJsonLdStringify()` from 'react-helmet-pro' or a structured data component instead.",
      unsafeRawString:
        "Unsafe JSON-LD: innerHTML uses a raw string. " +
        "Use `safeJsonLdStringify()` from 'react-helmet-pro' to prevent XSS injection.",
    },
  },
  create(context) {
    const isJsonLdScript = (node: {
      type: string;
      properties?: Array<{
        type: string;
        key?: { type: string; name?: string };
        value?: { type: string; value?: unknown };
      }>;
    }): boolean => {
      if (!node.properties) return false;
      return node.properties.some(
        (p) =>
          p.type === "Property" &&
          p.key?.type === "Identifier" &&
          p.key?.name === "type" &&
          p.value?.type === "Literal" &&
          p.value?.value === "application/ld+json",
      );
    };

    const checkInnerHtml = (
      valueNode: {
        type: string;
        quasis?: Array<{ value?: { cooked?: string } }>;
        expressions?: unknown[];
      },
      reportNode: object,
    ) => {
      if (valueNode.type === "TemplateLiteral") {
        // Template literals with expressions are unsafe
        if (valueNode.expressions && valueNode.expressions.length > 0) {
          context.report({ node: reportNode as never, messageId: "unsafeInnerHtml" });
        } else {
          // Tagged template with no expressions: still potentially unsafe
          context.report({ node: reportNode as never, messageId: "unsafeRawString" });
        }
      } else if (valueNode.type === "Literal") {
        context.report({ node: reportNode as never, messageId: "unsafeRawString" });
      }
    };

    return {
      // Detects: <Helmet script={[{ type: "application/ld+json", innerHTML: `...` }]} />
      JSXAttribute(node) {
        if (
          node.name.type !== "JSXIdentifier" ||
          node.name.name !== "script" ||
          !node.value ||
          node.value.type !== "JSXExpressionContainer"
        ) {
          return;
        }

        const expr = node.value.expression;
        if (expr.type !== "ArrayExpression") return;

        for (const element of expr.elements) {
          if (!element || element.type !== "ObjectExpression") continue;
          if (!isJsonLdScript(element as never)) continue;

          for (const prop of (element as { properties: Array<{ type: string; key?: { type: string; name?: string }; value?: { type: string; quasis?: Array<{ value?: { cooked?: string } }>; expressions?: unknown[] } }> }).properties) {
            if (
              prop.type !== "Property" ||
              prop.key?.type !== "Identifier" ||
              prop.key?.name !== "innerHTML" ||
              !prop.value
            )
              continue;
            checkInnerHtml(prop.value, prop);
          }
        }
      },

      // Detects: <script type="application/ld+json">{`...`}</script>
      JSXElement(node) {
        const opening = node.openingElement;
        if (
          opening.name.type !== "JSXIdentifier" ||
          opening.name.name !== "script"
        )
          return;

        const typeAttr = opening.attributes.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a: any) =>
            a.type === "JSXAttribute" &&
            a.name.type === "JSXIdentifier" &&
            a.name.name === "type" &&
            a.value?.type === "Literal" &&
            (a.value as { value?: unknown }).value === "application/ld+json",
        );
        if (!typeAttr) return;

        for (const child of node.children) {
          if (child.type === "JSXExpressionContainer") {
            checkInnerHtml(child.expression as never, child);
          }
        }
      },
    };
  },
};

export default safeJsonLdRule;
