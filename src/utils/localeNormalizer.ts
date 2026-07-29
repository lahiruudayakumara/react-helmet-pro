import type { SeoAlternateLink } from "../components/Seo";
import type { HreflangMap } from "../types/localized";
import type { UrlNormalizationOptions } from "../types/urlPolicy";
import { normalizeSeoUrl } from "./urlNormalizer";

const BCP47_PATTERN = /^([a-zA-Z]{2,3})(?:[_-]([a-zA-Z]{4}))?(?:[_-]([a-zA-Z]{2}|[0-9]{3}))?$/;

export const normalizeLocaleCode = (locale: string): string => {
  if (!locale) {
    return "";
  }

  const trimmed = locale.trim();

  if (trimmed.toLowerCase() === "x-default") {
    return "x-default";
  }

  const match = trimmed.match(BCP47_PATTERN);
  if (!match) {
    return trimmed.replace(/_/g, "-");
  }

  const [, lang, script, region] = match;
  let normalized = lang.toLowerCase();

  if (script) {
    normalized += `-${script.charAt(0).toUpperCase()}${script.slice(1).toLowerCase()}`;
  }

  if (region) {
    normalized += `-${region.toUpperCase()}`;
  }

  return normalized;
};

export interface BuildHreflangOptions {
  autoSelfReference?: boolean;
  autoXDefault?: boolean;
  currentLocale?: string;
  urlPolicy?: UrlNormalizationOptions;
  xDefault?: string;
}

export const buildHreflangLinks = (
  locales: HreflangMap = {},
  options: BuildHreflangOptions = {},
): SeoAlternateLink[] => {
  const links: SeoAlternateLink[] = [];
  const processedHreflangs = new Set<string>();

  Object.entries(locales).forEach(([rawHreflang, url]) => {
    const normalizedHreflang = normalizeLocaleCode(rawHreflang);
    const normalizedUrl = normalizeSeoUrl(url, options.urlPolicy);

    if (!processedHreflangs.has(normalizedHreflang)) {
      processedHreflangs.add(normalizedHreflang);
      links.push({
        href: normalizedUrl,
        hrefLang: normalizedHreflang,
      });
    }
  });

  // Handle x-default fallback
  if (!processedHreflangs.has("x-default")) {
    let resolvedXDefaultUrl: string | undefined;

    if (options.xDefault) {
      resolvedXDefaultUrl = normalizeSeoUrl(options.xDefault, options.urlPolicy);
    } else if (options.autoXDefault !== false) {
      if (locales["x-default"]) {
        resolvedXDefaultUrl = normalizeSeoUrl(locales["x-default"], options.urlPolicy);
      } else if (options.currentLocale && locales[options.currentLocale]) {
        resolvedXDefaultUrl = normalizeSeoUrl(locales[options.currentLocale], options.urlPolicy);
      } else {
        const firstEntry = Object.values(locales)[0];
        if (firstEntry) {
          resolvedXDefaultUrl = normalizeSeoUrl(firstEntry, options.urlPolicy);
        }
      }
    }

    if (resolvedXDefaultUrl) {
      links.push({
        href: resolvedXDefaultUrl,
        hrefLang: "x-default",
      });
      processedHreflangs.add("x-default");
    }
  }

  // Deterministic sorting by hrefLang code for SSR / DOM identity
  links.sort((a, b) => {
    const langA = a.hrefLang ?? "";
    const langB = b.hrefLang ?? "";
    return langA.localeCompare(langB);
  });

  return links;
};
