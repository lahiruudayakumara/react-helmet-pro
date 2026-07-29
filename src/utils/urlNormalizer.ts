import type { UrlNormalizationOptions } from "../types/urlPolicy";
import { DEFAULT_TRACKING_PARAMS } from "../types/urlPolicy";

const HAS_FILE_EXTENSION_PATTERN = /\.[a-zA-Z0-9]+$/;

const isTrackingParam = (paramName: string): boolean => {
  const lower = paramName.toLowerCase();
  return lower.startsWith("utm_") || DEFAULT_TRACKING_PARAMS.has(lower);
};

export const normalizeSeoUrl = (
  url: string | URL,
  options: UrlNormalizationOptions = {},
): string => {
  if (!url) {
    return "";
  }

  const rawUrlString = typeof url === "string" ? url.trim() : url.href;

  if (!rawUrlString) {
    return "";
  }

  let parsed: URL;
  const baseUrlString = options.baseUrl
    ? typeof options.baseUrl === "string"
      ? options.baseUrl
      : options.baseUrl.href
    : undefined;

  try {
    if (baseUrlString) {
      parsed = new URL(rawUrlString, baseUrlString);
    } else {
      parsed = new URL(rawUrlString);
    }
  } catch {
    return rawUrlString;
  }

  // Handle host lowercasing (URL standard lowercases, but ensure explicitly if requested)
  if (options.lowercaseHost !== false && parsed.hostname) {
    parsed.hostname = parsed.hostname.toLowerCase();
  }

  // Handle trailing slash rules
  if (options.trailingSlash === "always") {
    if (
      !parsed.pathname.endsWith("/") &&
      !HAS_FILE_EXTENSION_PATTERN.test(parsed.pathname)
    ) {
      parsed.pathname = `${parsed.pathname}/`;
    }
  } else if (options.trailingSlash === "never") {
    if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    }
  }

  // Handle fragment stripping
  if (options.stripFragment) {
    parsed.hash = "";
  }

  // Handle query parameter filtering and sorting
  const allowedSet = options.allowedQueryParams
    ? new Set(options.allowedQueryParams.map((k) => k.toLowerCase()))
    : undefined;
  const deniedSet = options.deniedQueryParams
    ? new Set(options.deniedQueryParams.map((k) => k.toLowerCase()))
    : undefined;

  const entries: Array<[string, string]> = [];

  parsed.searchParams.forEach((val, key) => {
    const lowerKey = key.toLowerCase();

    if (options.stripTrackingParams && isTrackingParam(key)) {
      return;
    }

    if (deniedSet && deniedSet.has(lowerKey)) {
      return;
    }

    if (allowedSet && !allowedSet.has(lowerKey)) {
      return;
    }

    entries.push([key, val]);
  });

  if (options.sortQueryParams) {
    entries.sort(([keyA, valA], [keyB, valB]) => {
      const keyCompare = keyA.localeCompare(keyB);
      return keyCompare !== 0 ? keyCompare : valA.localeCompare(valB);
    });
  }

  // Re-build search params
  if (entries.length < parsed.searchParams.size || options.sortQueryParams) {
    parsed.search = "";
    entries.forEach(([key, val]) => {
      parsed.searchParams.append(key, val);
    });
  }

  return parsed.href;
};

export const createUrlNormalizer = (
  options: UrlNormalizationOptions,
): ((url: string | URL) => string) => {
  return (url: string | URL) => normalizeSeoUrl(url, options);
};
