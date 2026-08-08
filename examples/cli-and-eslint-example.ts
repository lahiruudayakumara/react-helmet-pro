/**
 * Developer Tooling Examples - CLI Audit, ESLint Plugin, and Browser Inspector
 *
 * @see react-helmet-pro/cli
 * @see react-helmet-pro/eslint
 * @see react-helmet-pro/inspector (dev-only)
 */

// ─── 1. CLI Programmatic Audit ───────────────────────────────────────────────

import { runAudit } from "react-helmet-pro/cli";

export async function auditMyBuildDir() {
  // Audit a local HTML file
  const localResult = await runAudit(["./dist/index.html"], {
    format: "text",
    maxWarnings: 5,
  });

  console.log(localResult.output);
  process.exit(localResult.exitCode);
}

export async function auditRemoteUrl() {
  // Audit a remote URL (explicit opt-in, security-reviewed)
  const remoteResult = await runAudit(["https://example.com"], {
    format: "json",
    timeout: 8000,
  });
  return remoteResult.results;
}

export async function generateSarifReport() {
  // Generate SARIF output for GitHub Code Scanning
  const result = await runAudit(["./dist/index.html"], {
    format: "sarif",
  });

  // In CI: pipe result.output to .github/workflows/sarif-upload
  console.log(result.output);
}

// ─── 2. ESLint Plugin Configuration ─────────────────────────────────────────

// eslint.config.mjs (ESLint v9 flat config)
//
//   import reactHelmetPro from 'react-helmet-pro/eslint';
//
//   export default [
//     ...reactHelmetPro.configs.recommended,
//     {
//       rules: {
//         // Opt-in: enforce canonical on all SEO components
//         'react-helmet-pro/require-canonical': 'warn',
//         // Elevate safe-json-ld to error (also the default)
//         'react-helmet-pro/safe-json-ld': 'error',
//       },
//     },
//   ];

// .eslintrc.json (ESLint v8 legacy config)
//
//   {
//     "plugins": ["react-helmet-pro"],
//     "extends": ["plugin:react-helmet-pro/recommended"]
//   }

// ─── 3. Browser Dev Inspector ────────────────────────────────────────────────

// In your app root (development-only guard required):
//
//   import { HelmetProvider } from 'react-helmet-pro';
//
//   // Dynamic import to exclude from production bundle
//   const HelmetInspector =
//     process.env.NODE_ENV !== 'production'
//       ? React.lazy(() =>
//           import('react-helmet-pro/inspector').then((m) => ({ default: m.HelmetInspector }))
//         )
//       : null;
//
//   export function App() {
//     return (
//       <HelmetProvider>
//         <Routes />
//         {process.env.NODE_ENV !== 'production' && HelmetInspector && (
//           <React.Suspense fallback={null}>
//             <HelmetInspector position="bottom-right" maxHistory={20} />
//           </React.Suspense>
//         )}
//       </HelmetProvider>
//     );
//   }
