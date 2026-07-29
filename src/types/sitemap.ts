export interface SitemapImageExtension {
  caption?: string;
  geoLocation?: string;
  license?: string;
  title?: string;
  url: string;
}

export interface SitemapVideoExtension {
  contentUrl?: string;
  description: string;
  duration?: number;
  embedUrl?: string;
  publicationDate?: string;
  thumbnailUrl: string;
  title: string;
}

export interface SitemapNewsExtension {
  publication: {
    language: string;
    name: string;
  };
  publicationDate: string;
  title: string;
}

export interface SitemapHreflangExtension {
  href: string;
  hrefLang: string;
}

export type SitemapChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SitemapUrl {
  alternates?: SitemapHreflangExtension[];
  changefreq?: SitemapChangeFreq;
  images?: SitemapImageExtension[];
  lastmod?: string | Date;
  loc: string;
  news?: SitemapNewsExtension;
  priority?: number;
  videos?: SitemapVideoExtension[];
}

export interface SitemapIndexEntry {
  lastmod?: string | Date;
  loc: string;
}
