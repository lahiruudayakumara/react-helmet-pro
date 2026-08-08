import type { SeoRobotsDirectives, SeoRobotsRules } from "../types/robots";

export const buildRobotsString = (value?: SeoRobotsRules): string | undefined => {
  if (!value) {
    return undefined;
  }

  const parts: string[] = [];

  if (value.index !== undefined) {
    parts.push(value.index ? "index" : "noindex");
  }

  if (value.follow !== undefined) {
    parts.push(value.follow ? "follow" : "nofollow");
  }

  if (value.indexIfEmbedded) {
    parts.push("indexifembedded");
  }

  if (value.noarchive) {
    parts.push("noarchive");
  }

  if (value.nocache) {
    parts.push("nocache");
  }

  if (value.noimageindex) {
    parts.push("noimageindex");
  }

  if (value.nosnippet) {
    parts.push("nosnippet");
  }

  if (value.notranslate) {
    parts.push("notranslate");
  }

  if (value.noodp) {
    parts.push("noodp");
  }

  if (value.noydir) {
    parts.push("noydir");
  }

  if (value.maxImagePreview) {
    parts.push(`max-image-preview:${value.maxImagePreview}`);
  }

  if (value.maxSnippet !== undefined) {
    parts.push(`max-snippet:${value.maxSnippet}`);
  }

  if (value.maxVideoPreview !== undefined) {
    parts.push(`max-video-preview:${value.maxVideoPreview}`);
  }

  if (value.unavailableAfter) {
    parts.push(`unavailable_after:${value.unavailableAfter}`);
  }

  return parts.length ? parts.join(", ") : undefined;
};

export const buildXRobotsTagHeaderString = (
  directives?: SeoRobotsDirectives,
): string => {
  if (!directives) {
    return "";
  }

  const headerParts: string[] = [];

  // General robots rules
  const mainRobots = buildRobotsString(directives);
  if (mainRobots) {
    headerParts.push(mainRobots);
  }

  const addNamedCrawlerHeader = (userAgent: string, rules?: SeoRobotsRules) => {
    const rulesStr = buildRobotsString(rules);
    if (rulesStr) {
      headerParts.push(`${userAgent}: ${rulesStr}`);
    }
  };

  addNamedCrawlerHeader("googlebot", directives.googleBot);
  addNamedCrawlerHeader("googlebot-news", directives.googleBotNews);
  addNamedCrawlerHeader("bingbot", directives.bingBot);
  addNamedCrawlerHeader("duckduckbot", directives.duckDuckBot);

  if (directives.customCrawlers) {
    Object.entries(directives.customCrawlers).forEach(([ua, rules]) => {
      addNamedCrawlerHeader(ua.toLowerCase(), rules);
    });
  }

  return headerParts.join(", ");
};

export const buildXRobotsTagHeader = (
  directives?: SeoRobotsDirectives,
): Record<string, string> => {
  const headerValue = buildXRobotsTagHeaderString(directives);

  if (!headerValue) {
    return {};
  }

  return {
    "X-Robots-Tag": headerValue,
  };
};

export const extractXRobotsTagHeader = (
  value?: unknown,
): Record<string, string> => {
  if (!value) {
    return {};
  }

  let stateObj: any = value;
  if (typeof stateObj === "object" && stateObj !== null && "getState" in stateObj && typeof stateObj.getState === "function") {
    stateObj = stateObj.getState();
  }

  if (typeof stateObj === "object" && stateObj !== null && "meta" in stateObj) {
    const metaList = Array.isArray(stateObj.meta) ? stateObj.meta : undefined;
    if (metaList) {
      const parts: string[] = [];
      for (const tag of metaList) {
        if (tag && typeof tag === "object" && tag.name && tag.content) {
          const nameLower = String(tag.name).toLowerCase();
          if (nameLower === "robots") {
            parts.push(String(tag.content));
          } else if (nameLower === "googlebot" || nameLower === "bingbot" || nameLower === "duckduckbot") {
            parts.push(`${nameLower}: ${tag.content}`);
          }
        }
      }
      if (parts.length > 0) {
        return { "X-Robots-Tag": parts.join(", ") };
      }
    }
  }

  return buildXRobotsTagHeader(value as SeoRobotsDirectives);
};

