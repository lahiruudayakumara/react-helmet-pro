/**
 * react-helmet-pro ESLint Plugin
 *
 * Provides static analysis rules for missing/conflicting metadata
 * and unsafe raw JSON-LD, compatible with ESLint v8 (legacy) and v9 (flat config).
 *
 * Usage (ESLint v9 flat config):
 * ```js
 * import reactHelmetPro from 'react-helmet-pro/eslint';
 *
 * export default [
 *   ...reactHelmetPro.configs.recommended,
 * ];
 * ```
 *
 * Usage (ESLint v8 .eslintrc):
 * ```json
 * {
 *   "plugins": ["react-helmet-pro"],
 *   "extends": ["plugin:react-helmet-pro/recommended"]
 * }
 * ```
 */
import noDuplicateMeta from "./rules/noDuplicateMeta";
import requireCanonical from "./rules/requireCanonical";
import requireTitle from "./rules/requireTitle";
import safeJsonLd from "./rules/safeJsonLd";
import type { Rule } from "./rules/types";

const rules: Record<string, Rule> = {
  "require-title": requireTitle,
  "no-duplicate-meta": noDuplicateMeta,
  "safe-json-ld": safeJsonLd,
  "require-canonical": requireCanonical,
};

/**
 * Recommended ESLint v9 flat config configuration.
 */
const recommended = [
  {
    plugins: {
      "react-helmet-pro": { rules },
    },
    rules: {
      "react-helmet-pro/require-title": "warn",
      "react-helmet-pro/no-duplicate-meta": "warn",
      "react-helmet-pro/safe-json-ld": "error",
      "react-helmet-pro/require-canonical": "off",
    },
  },
];

/**
 * ESLint v8 legacy plugin format.
 */
const plugin = {
  meta: {
    name: "react-helmet-pro",
    version: "2.2.0",
  },
  rules,
  configs: {
    /** Flat config (ESLint v9) */
    recommended,
    /** Legacy config (ESLint v8) */
    "recommended-legacy": {
      plugins: ["react-helmet-pro"],
      rules: {
        "react-helmet-pro/require-title": "warn",
        "react-helmet-pro/no-duplicate-meta": "warn",
        "react-helmet-pro/safe-json-ld": "error",
        "react-helmet-pro/require-canonical": "off",
      },
    },
  },
};

export default plugin;
export { rules };
export type { Rule };
