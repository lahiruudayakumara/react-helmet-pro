export type TrailingSlashPolicy = "always" | "never" | "preserve";

export interface UrlNormalizationOptions {
  /** Explicit list of query parameter names to allow (all others are stripped). */
  allowedQueryParams?: string[];
  /** Base URL (string or URL object) used to resolve relative paths. */
  baseUrl?: string | URL;
  /** List of query parameter names to strip. */
  deniedQueryParams?: string[];
  /** Lowercases the scheme and hostname if true. Default: true */
  lowercaseHost?: boolean;
  /** Sorts query parameter keys alphabetically if true. Default: false */
  sortQueryParams?: boolean;
  /** Strips URL hash fragments (#section) if true. Default: false */
  stripFragment?: boolean;
  /** Strips common analytics and marketing tracking query parameters if true. Default: false */
  stripTrackingParams?: boolean;
  /** Controls trailing slash behavior on URL pathnames. Default: 'preserve' */
  trailingSlash?: TrailingSlashPolicy;
}

export const DEFAULT_TRACKING_PARAMS = new Set<string>([
  "fbclid",
  "gclid",
  "mc_eid",
  "msclkid",
  "utm_campaign",
  "utm_content",
  "utm_id",
  "utm_medium",
  "utm_name",
  "utm_reader",
  "utm_source",
  "utm_term",
]);
