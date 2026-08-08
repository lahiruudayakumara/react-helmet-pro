import { auditHelmetState } from "../core/auditHelmetState";
import type { AuditHelmetStateOptions, HelmetAuditResult } from "../types/diagnostics";
import { parseHtmlToHelmetState } from "./htmlParser";
import { formatAsSarif, type SarifLog } from "./sarifFormatter";

export type AuditFormat = "text" | "json" | "sarif";

export interface AuditRunOptions {
  /**
   * Audit options forwarded to the core audit engine.
   */
  auditOptions?: AuditHelmetStateOptions;
  /**
   * Output format: "text" (default), "json", or "sarif".
   */
  format?: AuditFormat;
  /**
   * Maximum number of warnings before the audit is considered failed.
   * -1 means unlimited (default).
   */
  maxWarnings?: number;
  /**
   * Timeout in milliseconds for remote URL fetching. Default: 5000.
   */
  timeout?: number;
}

export interface AuditTarget {
  html: string;
  uri: string;
}

export interface AuditRunResult {
  exitCode: 0 | 1;
  output: string;
  results: Array<{ result: HelmetAuditResult; uri: string }>;
}

/**
 * Fetches remote HTML with a configurable timeout.
 * Throws if the fetch fails or exceeds the timeout.
 */
const fetchWithTimeout = async (
  url: string,
  timeoutMs: number,
): Promise<string> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} ${response.statusText} fetching ${url}`,
      );
    }
    return response.text();
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Resolves audit targets from a list of URIs (local file paths or remote URLs).
 * File-system URIs require Node.js `fs` module.
 */
const resolveTargets = async (
  uris: string[],
  timeoutMs: number,
): Promise<AuditTarget[]> => {
  const results: AuditTarget[] = [];

  for (const uri of uris) {
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      // Security: remote auditing is explicitly opt-in via passing a URL.
      const html = await fetchWithTimeout(uri, timeoutMs);
      results.push({ uri, html });
    } else {
      // Dynamic import to allow tree-shaking in browser environments.
      const { readFileSync } = await import("node:fs");
      const html = readFileSync(uri, "utf8");
      results.push({ uri, html });
    }
  }

  return results;
};

const formatTextResult = (
  uri: string,
  result: HelmetAuditResult,
): string => {
  const lines: string[] = [`\n── ${uri} ──`];
  if (result.diagnostics.length === 0) {
    lines.push("  ✓ No issues found");
    return lines.join("\n");
  }
  for (const d of result.diagnostics) {
    const icon =
      d.severity === "error" ? "✖" : d.severity === "warning" ? "⚠" : "ℹ";
    lines.push(`  ${icon} [${d.id}] ${d.message}`);
  }
  return lines.join("\n");
};

/**
 * Core audit runner. Audits one or more HTML sources (files, directories, or remote URLs)
 * and returns structured results with a deterministic exit code.
 */
export const runAudit = async (
  uris: string[],
  options: AuditRunOptions = {},
): Promise<AuditRunResult> => {
  const {
    format = "text",
    maxWarnings = -1,
    timeout = 5000,
    auditOptions = { context: "seo" },
  } = options;

  const targets = await resolveTargets(uris, timeout);
  const results: Array<{ result: HelmetAuditResult; uri: string }> = [];

  for (const target of targets) {
    const state = parseHtmlToHelmetState(target.html);
    const result = auditHelmetState(state, auditOptions);
    results.push({ uri: target.uri, result });
  }

  // Determine exit code
  const hasErrors = results.some((r) => !r.result.valid);
  const totalWarnings = results.reduce(
    (sum, r) => sum + r.result.warnings.length,
    0,
  );
  const exceedsWarningLimit =
    maxWarnings >= 0 && totalWarnings > maxWarnings;
  const exitCode: 0 | 1 = hasErrors || exceedsWarningLimit ? 1 : 0;

  // Format output
  let output: string;
  if (format === "json") {
    output = JSON.stringify(results, null, 2);
  } else if (format === "sarif") {
    const mergedDiagnostics = results.flatMap((r) => r.result.diagnostics);
    const mergedResult: HelmetAuditResult = {
      diagnostics: mergedDiagnostics,
      errors: mergedDiagnostics.filter((d) => d.severity === "error"),
      warnings: mergedDiagnostics.filter((d) => d.severity === "warning"),
      suggestions: mergedDiagnostics.filter(
        (d) => d.severity === "suggestion",
      ),
      valid: !hasErrors,
    };
    const sarif: SarifLog = formatAsSarif(
      mergedResult,
      results.map((r) => r.uri).join(", "),
    );
    output = JSON.stringify(sarif, null, 2);
  } else {
    const lines: string[] = [
      "react-helmet-pro audit",
      "═".repeat(40),
    ];
    for (const { uri, result } of results) {
      lines.push(formatTextResult(uri, result));
    }
    lines.push("\n" + "═".repeat(40));
    const errCount = results.reduce((n, r) => n + r.result.errors.length, 0);
    const warnCount = results.reduce(
      (n, r) => n + r.result.warnings.length,
      0,
    );
    lines.push(
      `Summary: ${errCount} error(s), ${warnCount} warning(s) across ${results.length} file(s)`,
    );
    if (exitCode === 1 && exceedsWarningLimit) {
      lines.push(
        `Exceeded max-warnings threshold of ${maxWarnings} (found ${totalWarnings})`,
      );
    }
    output = lines.join("\n");
  }

  return { exitCode, output, results };
};
