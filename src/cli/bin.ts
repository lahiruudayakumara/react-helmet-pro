#!/usr/bin/env node
/**
 * react-helmet-pro-audit
 *
 * CLI binary for auditing rendered HTML files, static directories, and remote URLs.
 *
 * Usage:
 *   react-helmet-pro-audit --file=path/to/index.html
 *   react-helmet-pro-audit --url=https://example.com --format=sarif
 *   react-helmet-pro-audit --file=./dist/index.html --format=json --max-warnings=5
 *   react-helmet-pro-audit --url=https://example.com --timeout=8000
 */
import { runAudit } from "./auditRunner";
import type { AuditFormat } from "./auditRunner";

const parseArgs = (
  argv: string[],
): {
  format: AuditFormat;
  maxWarnings: number;
  timeout: number;
  uris: string[];
} => {
  const uris: string[] = [];
  let format: AuditFormat = "text";
  let maxWarnings = -1;
  let timeout = 5000;

  for (const arg of argv) {
    if (arg.startsWith("--file=")) {
      uris.push(arg.slice("--file=".length));
    } else if (arg.startsWith("--url=")) {
      uris.push(arg.slice("--url=".length));
    } else if (arg.startsWith("--format=")) {
      const f = arg.slice("--format=".length) as AuditFormat;
      if (f === "text" || f === "json" || f === "sarif") {
        format = f;
      } else {
        console.error(`Unknown format "${f}". Allowed: text, json, sarif`);
        process.exit(1);
      }
    } else if (arg.startsWith("--max-warnings=")) {
      maxWarnings = Number(arg.slice("--max-warnings=".length));
    } else if (arg.startsWith("--timeout=")) {
      timeout = Number(arg.slice("--timeout=".length));
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
react-helmet-pro-audit – SEO head audit CLI

Usage:
  react-helmet-pro-audit [options]

Options:
  --file=<path>         Audit a local HTML file
  --url=<url>           Audit a remote URL (explicit opt-in, HTTPS recommended)
  --format=<format>     Output format: text (default), json, sarif
  --max-warnings=<n>    Exit with code 1 when warnings exceed this count
  --timeout=<ms>        Remote fetch timeout in milliseconds (default: 5000)
  --help, -h            Show this help message

Examples:
  react-helmet-pro-audit --file=dist/index.html
  react-helmet-pro-audit --url=https://example.com --format=sarif
  react-helmet-pro-audit --file=dist/index.html --format=json --max-warnings=0
      `.trim());
      process.exit(0);
    }
  }

  return { format, maxWarnings, timeout, uris };
};

const main = async () => {
  const argv = process.argv.slice(2);
  const { format, maxWarnings, timeout, uris } = parseArgs(argv);

  if (uris.length === 0) {
    console.error(
      "react-helmet-pro-audit: no targets provided. Use --file=<path> or --url=<url>",
    );
    process.exit(1);
  }

  try {
    const { exitCode, output } = await runAudit(uris, {
      format,
      maxWarnings,
      timeout,
      auditOptions: { context: "seo" },
    });
    console.log(output);
    process.exit(exitCode);
  } catch (err) {
    console.error(
      "react-helmet-pro-audit error:",
      err instanceof Error ? err.message : String(err),
    );
    process.exit(1);
  }
};

main();
