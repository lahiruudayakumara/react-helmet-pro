import type { HelmetAttributes } from "./tags";

export const HELMET_SECURITY_RULE_IDS = {
  BLOB_URL: "RHP_SECURITY_BLOB_URL",
  CUSTOM_URL_SCHEME: "RHP_SECURITY_CUSTOM_URL_SCHEME",
  DANGEROUS_URL_SCHEME: "RHP_SECURITY_DANGEROUS_URL_SCHEME",
  DATA_URL: "RHP_SECURITY_DATA_URL",
  EVENT_HANDLER_ATTRIBUTE: "RHP_SECURITY_EVENT_HANDLER_ATTRIBUTE",
  PROTOCOL_RELATIVE_URL: "RHP_SECURITY_PROTOCOL_RELATIVE_URL",
  SUSPICIOUS_ATTRIBUTE_NAME: "RHP_SECURITY_SUSPICIOUS_ATTRIBUTE_NAME",
  UNEXPECTED_URL_SCHEME: "RHP_SECURITY_UNEXPECTED_URL_SCHEME",
} as const;

export type HelmetSecurityRuleId =
  (typeof HELMET_SECURITY_RULE_IDS)[keyof typeof HELMET_SECURITY_RULE_IDS];

export type HelmetDiagnosticSeverity = "error" | "warning" | "suggestion";

export type HelmetDiagnosticTagName =
  | "base"
  | "bodyAttributes"
  | "htmlAttributes"
  | "link"
  | "meta"
  | "noscript"
  | "script"
  | "style"
  | "titleAttributes";

export interface HelmetDiagnosticSource {
  attribute: string;
  tag: HelmetAttributes;
  tagIndex?: number;
  tagName: HelmetDiagnosticTagName;
}

export interface HelmetDiagnostic {
  id: HelmetSecurityRuleId;
  message: string;
  severity: HelmetDiagnosticSeverity;
  source: HelmetDiagnosticSource;
  value?: string;
}

export interface HelmetDiagnosticSuppression {
  attribute?: string;
  ruleId: HelmetSecurityRuleId;
  tagIndex?: number;
  tagName?: HelmetDiagnosticTagName;
}

export interface AuditHelmetStateOptions {
  /**
   * `raw` reflects the permissive low-level Helmet API. `seo` applies the
   * stricter URL expectations used by the high-level SEO helpers.
   */
  context?: "raw" | "seo";
  severities?: Partial<
    Record<HelmetSecurityRuleId, HelmetDiagnosticSeverity | "off">
  >;
  suppressions?: Array<HelmetSecurityRuleId | HelmetDiagnosticSuppression>;
}

export interface HelmetAuditResult {
  diagnostics: HelmetDiagnostic[];
  errors: HelmetDiagnostic[];
  suggestions: HelmetDiagnostic[];
  valid: boolean;
  warnings: HelmetDiagnostic[];
}
