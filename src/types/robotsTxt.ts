export interface RobotsTxtUserAgentRule {
  allow?: string | string[];
  crawlDelay?: number;
  disallow?: string | string[];
  userAgent: string | string[];
}

export interface RobotsTxtOptions {
  cleanParam?: string;
  host?: string;
  rules: RobotsTxtUserAgentRule[];
  sitemaps?: string[];
}
