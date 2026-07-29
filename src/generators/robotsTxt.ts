import type { RobotsTxtOptions } from "../types/robotsTxt";

export const buildRobotsTxt = (options: RobotsTxtOptions): string => {
  const lines: string[] = [];

  options.rules.forEach((rule, index) => {
    if (index > 0) {
      lines.push("");
    }

    const agents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent];
    agents.forEach((ua) => {
      lines.push(`User-agent: ${ua}`);
    });

    if (rule.allow) {
      const allows = Array.isArray(rule.allow) ? rule.allow : [rule.allow];
      allows.forEach((path) => lines.push(`Allow: ${path}`));
    }

    if (rule.disallow) {
      const disallows = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
      disallows.forEach((path) => lines.push(`Disallow: ${path}`));
    }

    if (rule.crawlDelay !== undefined) {
      lines.push(`Crawl-delay: ${rule.crawlDelay}`);
    }
  });

  if (options.cleanParam) {
    lines.push("");
    lines.push(`Clean-param: ${options.cleanParam}`);
  }

  if (options.host) {
    lines.push("");
    lines.push(`Host: ${options.host}`);
  }

  if (options.sitemaps?.length) {
    lines.push("");
    options.sitemaps.forEach((sitemap) => {
      lines.push(`Sitemap: ${sitemap}`);
    });
  }

  return lines.join("\n");
};

export const isProductionRobotsBlocking = (robotsTxtContent: string): boolean => {
  if (!robotsTxtContent) {
    return false;
  }

  const sections = robotsTxtContent.split(/\n\s*\n/);

  for (const section of sections) {
    const lines = section
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const hasWildcardAgent = lines.some((l) =>
      /^User-agent:\s*\*$/i.test(l),
    );

    if (hasWildcardAgent) {
      const hasBlockAllDisallow = lines.some((l) =>
        /^Disallow:\s*\/\s*$/i.test(l),
      );
      if (hasBlockAllDisallow) {
        return true;
      }
    }
  }

  return false;
};
