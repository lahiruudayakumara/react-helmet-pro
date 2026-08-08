import {
  toBeIndexable,
  toHaveCanonical,
  toHaveHreflang,
  toHaveValidStructuredData,
} from "./matchers";

export * from "./matchers";
export { helmetSnapshotSerializer } from "./serializer";
export { parseHtmlToHelmetState } from "../cli/htmlParser";

export const seoMatchers = {
  toHaveCanonical,
  toBeIndexable,
  toHaveValidStructuredData,
  toHaveHreflang,
};

/**
 * Registers all custom SEO matchers with Jest or Vitest globally.
 * 
 * Usage in Vitest (vitest.setup.ts):
 * ```ts
 * import { registerMatchers } from 'react-helmet-pro/testing';
 * registerMatchers();
 * ```
 * 
 * Or manually:
 * ```ts
 * import { expect } from 'vitest';
 * import { seoMatchers } from 'react-helmet-pro/testing';
 * expect.extend(seoMatchers);
 * ```
 */
export function registerMatchers() {
  // Check for vitest or jest global expect
  const g = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : global);
  const exp = (g as any).expect;
  if (exp && typeof exp.extend === "function") {
    exp.extend(seoMatchers);
  }
}
export default registerMatchers;
