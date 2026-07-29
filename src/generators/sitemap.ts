import type { SitemapIndexEntry, SitemapUrl } from "../types/sitemap";

export const escapeXml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const formatDate = (date?: string | Date): string => {
  if (!date) {
    return "";
  }
  if (date instanceof Date) {
    return date.toISOString();
  }
  return date;
};

export const chunkSitemapUrls = (
  urls: SitemapUrl[],
  maxPerChunk = 50000,
): SitemapUrl[][] => {
  const chunks: SitemapUrl[][] = [];
  for (let i = 0; i < urls.length; i += maxPerChunk) {
    chunks.push(urls.slice(i, i + maxPerChunk));
  }
  return chunks;
};

export const buildSitemapXml = (urls: SitemapUrl[]): string => {
  let hasImages = false;
  let hasVideos = false;
  let hasNews = false;
  let hasAlternates = false;

  urls.forEach((u) => {
    if (u.images?.length) hasImages = true;
    if (u.videos?.length) hasVideos = true;
    if (u.news) hasNews = true;
    if (u.alternates?.length) hasAlternates = true;
  });

  const namespaces: string[] = ['xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'];
  if (hasImages) {
    namespaces.push('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
  }
  if (hasVideos) {
    namespaces.push('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"');
  }
  if (hasNews) {
    namespaces.push('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
  }
  if (hasAlternates) {
    namespaces.push('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  }

  const urlXmlNodes = urls.map((entry) => {
    const parts: string[] = ["  <url>"];
    parts.push(`    <loc>${escapeXml(entry.loc)}</loc>`);

    if (entry.lastmod) {
      parts.push(`    <lastmod>${escapeXml(formatDate(entry.lastmod))}</lastmod>`);
    }

    if (entry.changefreq) {
      parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    }

    if (entry.priority !== undefined) {
      parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
    }

    entry.alternates?.forEach((alt) => {
      parts.push(
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hrefLang)}" href="${escapeXml(alt.href)}" />`,
      );
    });

    entry.images?.forEach((img) => {
      parts.push("    <image:image>");
      parts.push(`      <image:loc>${escapeXml(img.url)}</image:loc>`);
      if (img.title) {
        parts.push(`      <image:title>${escapeXml(img.title)}</image:title>`);
      }
      if (img.caption) {
        parts.push(`      <image:caption>${escapeXml(img.caption)}</image:caption>`);
      }
      if (img.license) {
        parts.push(`      <image:license>${escapeXml(img.license)}</image:license>`);
      }
      if (img.geoLocation) {
        parts.push(`      <image:geo_location>${escapeXml(img.geoLocation)}</image:geo_location>`);
      }
      parts.push("    </image:image>");
    });

    entry.videos?.forEach((vid) => {
      parts.push("    <video:video>");
      parts.push(`      <video:thumbnail_loc>${escapeXml(vid.thumbnailUrl)}</video:thumbnail_loc>`);
      parts.push(`      <video:title>${escapeXml(vid.title)}</video:title>`);
      parts.push(`      <video:description>${escapeXml(vid.description)}</video:description>`);
      if (vid.contentUrl) {
        parts.push(`      <video:content_loc>${escapeXml(vid.contentUrl)}</video:content_loc>`);
      }
      if (vid.embedUrl) {
        parts.push(`      <video:player_loc>${escapeXml(vid.embedUrl)}</video:player_loc>`);
      }
      if (vid.duration !== undefined) {
        parts.push(`      <video:duration>${vid.duration}</video:duration>`);
      }
      if (vid.publicationDate) {
        parts.push(`      <video:publication_date>${escapeXml(formatDate(vid.publicationDate))}</video:publication_date>`);
      }
      parts.push("    </video:video>");
    });

    if (entry.news) {
      parts.push("    <news:news>");
      parts.push("      <news:publication>");
      parts.push(`        <news:name>${escapeXml(entry.news.publication.name)}</news:name>`);
      parts.push(`        <news:language>${escapeXml(entry.news.publication.language)}</news:language>`);
      parts.push("      </news:publication>");
      parts.push(`      <news:publication_date>${escapeXml(formatDate(entry.news.publicationDate))}</news:publication_date>`);
      parts.push(`      <news:title>${escapeXml(entry.news.title)}</news:title>`);
      parts.push("    </news:news>");
    }

    parts.push("  </url>");
    return parts.join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<urlset ${namespaces.join(" ")}>`,
    ...urlXmlNodes,
    "</urlset>",
  ].join("\n");
};

export const buildSitemapIndexXml = (entries: SitemapIndexEntry[]): string => {
  const sitemapNodes = entries.map((entry) => {
    const parts: string[] = ["  <sitemap>"];
    parts.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    if (entry.lastmod) {
      parts.push(`    <lastmod>${escapeXml(formatDate(entry.lastmod))}</lastmod>`);
    }
    parts.push("  </sitemap>");
    return parts.join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapNodes,
    "</sitemapindex>",
  ].join("\n");
};
