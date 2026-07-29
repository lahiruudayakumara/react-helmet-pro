import type { RobotsTxtOptions } from "../types/robotsTxt";
import type { SitemapUrl } from "../types/sitemap";
import { buildRobotsTxt } from "./robotsTxt";
import { buildSitemapXml } from "./sitemap";

export const createSitemapRouteHandler = (urls: SitemapUrl[]) => {
  return () => {
    const xml = buildSitemapXml(urls);
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
      status: 200,
    });
  };
};

export const createRobotsTxtRouteHandler = (options: RobotsTxtOptions) => {
  return () => {
    const content = buildRobotsTxt(options);
    return new Response(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
      status: 200,
    });
  };
};
