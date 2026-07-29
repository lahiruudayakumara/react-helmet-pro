import type { SeoProps } from "../components/Seo";
import type { UrlNormalizationOptions } from "./urlPolicy";

export type HreflangMap = Record<string, string>;

export interface MediaAlternateLink {
  href: string;
  hrefLang?: string;
  media?: string;
  title?: string;
  type?: string;
}

export interface LocalizedSeoProps extends Omit<SeoProps, "alternates" | "canonical"> {
  /** Auto-includes self-referencing hreflang link for currentLocale if missing. Default: true */
  autoSelfReference?: boolean;
  /** Auto-populates x-default from locales['x-default'], currentLocale URL, or first locale URL. Default: true */
  autoXDefault?: boolean;
  /** Current active locale code for the rendered page (e.g. 'en-US', 'fr-FR', 'en'). */
  currentLocale: string;
  /** Optional map of locale code to localized meta description. */
  descriptionMap?: Record<string, string>;
  /** Map of locale code to URL (e.g. { 'en-US': 'https://example.com/en', 'fr-FR': 'https://example.com/fr' }). */
  locales: HreflangMap;
  /** Additional media alternate links (e.g. mobile versions, print versions, RSS). */
  mediaAlternates?: MediaAlternateLink[];
  /** Optional map of locale code to localized page title. */
  titleMap?: Record<string, string>;
  /** Opt-in URL normalization policy. */
  urlPolicy?: UrlNormalizationOptions;
  /** Explicit URL to use for x-default fallback link. */
  xDefault?: string;
}
