import type { SeoOpenGraph, SeoRobotsDirectives, SeoTwitter, SeoVerification } from "../components/Seo";

export interface HelmetSocialImageDefaults {
  alt?: string;
  height?: number;
  secureUrl?: string;
  type?: string;
  url: string;
  width?: number;
}

export interface HelmetFallbackOptions {
  /** Enables or disables canonical link fallback from siteUrl/baseUrl. Default: true */
  canonical?: boolean;
  /** Enables or disables html lang attribute fallback from locale. Default: true */
  locale?: boolean;
  /** Enables or disables Open Graph fallback derivation from core SEO fields. Default: true */
  openGraph?: boolean;
  /** Enables or disables Twitter fallback derivation from Open Graph or core SEO fields. Default: true */
  twitter?: boolean;
}

export interface HelmetSeoDefaults {
  baseUrl?: string;
  description?: string;
  fallbacks?: HelmetFallbackOptions | boolean;
  image?: string | HelmetSocialImageDefaults;
  locale?: string;
  openGraph?: Partial<SeoOpenGraph>;
  robots?: SeoRobotsDirectives;
  siteName?: string;
  siteUrl?: string;
  socialImage?: string | HelmetSocialImageDefaults;
  titleTemplate?: string;
  defaultTitle?: string;
  twitter?: Partial<SeoTwitter>;
  verification?: SeoVerification;
}
