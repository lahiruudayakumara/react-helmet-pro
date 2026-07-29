export interface SeoRobotsRules {
  follow?: boolean;
  index?: boolean;
  /** Only takes effect together with `index: false`. */
  indexIfEmbedded?: boolean;
  maxImagePreview?: "large" | "none" | "standard";
  maxSnippet?: number;
  maxVideoPreview?: number;
  noarchive?: boolean;
  nocache?: boolean;
  noimageindex?: boolean;
  nosnippet?: boolean;
  notranslate?: boolean;
  unavailableAfter?: string;

  /** Legacy / Deprecated directives supported for backward compatibility */
  noodp?: boolean;
  noydir?: boolean;
}

export interface SeoRobotsDirectives extends SeoRobotsRules {
  /** Rules specifically for Bing's search crawler. */
  bingBot?: SeoRobotsRules;
  /** Custom rules keyed by crawler user-agent name. */
  customCrawlers?: Record<string, SeoRobotsRules>;
  /** Rules specifically for DuckDuckGo's crawler. */
  duckDuckBot?: SeoRobotsRules;
  /** Rules specifically for Google's text search crawler. */
  googleBot?: SeoRobotsRules;
  /** Rules specifically for Google News. */
  googleBotNews?: SeoRobotsRules;
}

export const ROBOTS_PRESETS: Record<string, SeoRobotsRules> = {
  INDEX_FOLLOW: { follow: true, index: true },
  INDEX_NOFOLLOW: { follow: false, index: true },
  MAXIMAL: { follow: true, index: true, maxImagePreview: "large", maxSnippet: -1, maxVideoPreview: -1 },
  NOINDEX_FOLLOW: { follow: true, index: false },
  NOINDEX_NOFOLLOW: { follow: false, index: false },
  PRIVATE: { follow: false, index: false, noarchive: true, nocache: true, nosnippet: true },
} as const;

export type RobotsPresetName = keyof typeof ROBOTS_PRESETS;
