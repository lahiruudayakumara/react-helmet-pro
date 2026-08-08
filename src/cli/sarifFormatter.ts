import type { HelmetAuditResult, HelmetDiagnostic } from "../types/diagnostics";

export interface SarifResult {
  ruleId: string;
  level: "error" | "warning" | "note";
  message: { text: string };
  locations: Array<{
    physicalLocation: {
      artifactLocation: { uri: string };
      region?: { startLine: number };
    };
  }>;
}

export interface SarifLog {
  version: "2.1.0";
  $schema: string;
  runs: Array<{
    tool: {
      driver: {
        name: string;
        version: string;
        informationUri: string;
        rules: Array<{
          id: string;
          name: string;
          shortDescription: { text: string };
          helpUri?: string;
        }>;
      };
    };
    results: SarifResult[];
    artifacts: Array<{ location: { uri: string } }>;
  }>;
}

const severityToSarifLevel = (
  severity: HelmetDiagnostic["severity"],
): SarifResult["level"] => {
  if (severity === "error") return "error";
  if (severity === "warning") return "warning";
  return "note";
};

export const formatAsSarif = (
  auditResult: HelmetAuditResult,
  sourceUri: string,
): SarifLog => {
  const allDiagnostics = auditResult.diagnostics;

  const rulesSeen = new Map<string, HelmetDiagnostic>();
  for (const d of allDiagnostics) {
    if (!rulesSeen.has(d.id)) rulesSeen.set(d.id, d);
  }

  const rules = Array.from(rulesSeen.values()).map((d) => ({
    id: d.id,
    name: d.id
      .replace(/^RHP_(?:SEO|SECURITY)_/, "")
      .toLowerCase()
      .replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
    shortDescription: { text: d.message },
    helpUri: "https://github.com/opencorex-org/react-helmet-pro#diagnostics",
  }));

  const results: SarifResult[] = allDiagnostics.map((d) => ({
    ruleId: d.id,
    level: severityToSarifLevel(d.severity),
    message: { text: d.message },
    locations: [
      {
        physicalLocation: {
          artifactLocation: { uri: sourceUri },
        },
      },
    ],
  }));

  return {
    version: "2.1.0",
    $schema:
      "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "react-helmet-pro",
            version: "2.2.0",
            informationUri:
              "https://github.com/opencorex-org/react-helmet-pro",
            rules,
          },
        },
        results,
        artifacts: [{ location: { uri: sourceUri } }],
      },
    ],
  };
};
