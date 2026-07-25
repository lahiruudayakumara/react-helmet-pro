import {
  HELMET_SECURITY_RULE_IDS,
  type AuditHelmetStateOptions,
  type HelmetAuditResult,
  type HelmetAttributes,
  type HelmetDiagnostic,
  type HelmetDiagnosticSeverity,
  type HelmetDiagnosticSource,
  type HelmetDiagnosticSuppression,
  type HelmetDiagnosticTagName,
  type HelmetSecurityRuleId,
  type HelmetState,
} from "../types";

type UrlKind = "document" | "image" | "refresh" | "resource";

interface UrlLocation {
  attribute: string;
  kind: UrlKind;
  requireAbsolute?: boolean;
  requireHttps?: boolean;
  source: HelmetDiagnosticSource;
  value: string;
}

interface ClassifiedUrl {
  normalized: string;
  scheme?: string;
  type:
    | "absolute"
    | "blob"
    | "custom"
    | "dangerous"
    | "data"
    | "invalid"
    | "protocol-relative"
    | "relative";
}

const DANGEROUS_SCHEMES = new Set(["javascript", "vbscript"]);
const KNOWN_UNEXPECTED_SCHEMES = new Set([
  "file",
  "ftp",
  "mailto",
  "tel",
  "ws",
  "wss",
]);
const URL_META_PROPERTIES = new Map<string, UrlKind>([
  ["contenturl", "resource"],
  ["embedurl", "resource"],
  ["og:audio", "resource"],
  ["og:audio:secure_url", "resource"],
  ["og:audio:url", "resource"],
  ["og:image", "image"],
  ["og:image:secure_url", "image"],
  ["og:image:url", "image"],
  ["og:url", "document"],
  ["og:video", "resource"],
  ["og:video:secure_url", "resource"],
  ["og:video:url", "resource"],
  ["twitter:image", "image"],
  ["twitter:image:src", "image"],
  ["twitter:player", "resource"],
  ["twitter:player:stream", "resource"],
  ["twitter:url", "document"],
]);
const SUSPICIOUS_ATTRIBUTE_NAMES = new Set([
  "__proto__",
  "constructor",
  "dangerouslysetinnerhtml",
  "prototype",
]);
const ATTRIBUTE_NAME_PATTERN = /^[A-Za-z_:][A-Za-z0-9_.:-]*$/;
const CONTROL_OR_SPACE_PATTERN = /[\u0000-\u0020\u007f-\u009f]/g;

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&#(\d+);?/gi, (_match, code: string) =>
      String.fromCharCode(Number.parseInt(code, 10)),
    )
    .replace(/&#x([0-9a-f]+);?/gi, (_match, code: string) =>
      String.fromCharCode(Number.parseInt(code, 16)),
    )
    .replace(/&colon;?/gi, ":")
    .replace(/&newline;?/gi, "\n")
    .replace(/&tab;?/gi, "\t");

const decodeUrlForInspection = (value: string) => {
  let decoded = decodeHtmlEntities(value);

  for (let pass = 0; pass < 3; pass += 1) {
    const next = decoded.replace(/%([0-9a-f]{2})/gi, (_match, code: string) =>
      String.fromCharCode(Number.parseInt(code, 16)),
    );

    if (next === decoded) {
      break;
    }

    decoded = decodeHtmlEntities(next);
  }

  return decoded.trim();
};

const normalizeSchemePrefix = (value: string) => {
  const colonIndex = value.indexOf(":");

  if (colonIndex < 0) {
    return value;
  }

  const prefix = value.slice(0, colonIndex).replace(CONTROL_OR_SPACE_PATTERN, "");
  return `${prefix}${value.slice(colonIndex)}`;
};

const classifyUrl = (value: string): ClassifiedUrl => {
  const normalized = normalizeSchemePrefix(decodeUrlForInspection(value));

  if (normalized.startsWith("//") || normalized.startsWith("\\\\")) {
    return { normalized, type: "protocol-relative" };
  }

  const schemeMatch = normalized.match(/^([a-z][a-z0-9+.-]*):/i);
  if (!schemeMatch) {
    return {
      normalized,
      type: normalized.includes(":") ? "invalid" : "relative",
    };
  }

  const scheme = schemeMatch[1].toLowerCase();

  if (DANGEROUS_SCHEMES.has(scheme)) {
    return { normalized, scheme, type: "dangerous" };
  }

  if (scheme === "data") {
    return { normalized, scheme, type: "data" };
  }

  if (scheme === "blob") {
    return { normalized, scheme, type: "blob" };
  }

  if (scheme === "http" || scheme === "https") {
    return { normalized, scheme, type: "absolute" };
  }

  return {
    normalized,
    scheme,
    type: KNOWN_UNEXPECTED_SCHEMES.has(scheme) ? "invalid" : "custom",
  };
};

const getMetaUrlKind = (tag: Record<string, unknown>): UrlKind | undefined => {
  const property =
    typeof tag.property === "string"
      ? tag.property.toLowerCase()
      : typeof tag.name === "string"
        ? tag.name.toLowerCase()
        : typeof tag.itemProp === "string"
          ? tag.itemProp.toLowerCase()
          : "";

  if (URL_META_PROPERTIES.has(property)) {
    return URL_META_PROPERTIES.get(property);
  }

  if (property === "image" || property === "thumbnailurl") {
    return "image";
  }

  if (property === "url") {
    return "document";
  }

  return undefined;
};

const extractRefreshUrl = (content: string) => {
  const match = content.match(/(?:^|;)\s*url\s*=\s*(.*?)\s*$/i);
  if (!match) {
    return undefined;
  }

  const value = match[1];
  if (
    value.length >= 2 &&
    ((value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }

  return value;
};

const createSource = (
  tagName: HelmetDiagnosticTagName,
  tag: HelmetAttributes,
  attribute: string,
  tagIndex?: number,
): HelmetDiagnosticSource => ({
  attribute,
  tag: { ...tag },
  tagIndex,
  tagName,
});

const collectUrlLocations = (state: HelmetState): UrlLocation[] => {
  const locations: UrlLocation[] = [];

  state.base.forEach((tag, tagIndex) => {
    if (typeof tag.href === "string") {
      locations.push({
        attribute: "href",
        kind: "document",
        requireAbsolute: true,
        source: createSource("base", tag, "href", tagIndex),
        value: tag.href,
      });
    }
  });

  state.link.forEach((tag, tagIndex) => {
    if (typeof tag.href !== "string") {
      return;
    }

    const rel = typeof tag.rel === "string" ? tag.rel.toLowerCase() : "";
    locations.push({
      attribute: "href",
      kind: rel.includes("icon")
        ? "image"
        : rel === "canonical" || rel === "alternate"
          ? "document"
          : "resource",
      requireAbsolute: rel === "canonical",
      source: createSource("link", tag, "href", tagIndex),
      value: tag.href,
    });
  });

  state.script.forEach((tag, tagIndex) => {
    if (typeof tag.src === "string") {
      locations.push({
        attribute: "src",
        kind: "resource",
        source: createSource("script", tag, "src", tagIndex),
        value: tag.src,
      });
    }
  });

  state.meta.forEach((tag, tagIndex) => {
    if (typeof tag.content !== "string") {
      return;
    }

    if (
      typeof tag.httpEquiv === "string" &&
      tag.httpEquiv.toLowerCase() === "refresh"
    ) {
      const refreshUrl = extractRefreshUrl(tag.content);
      if (refreshUrl !== undefined) {
        locations.push({
          attribute: "content",
          kind: "refresh",
          source: createSource("meta", tag, "content", tagIndex),
          value: refreshUrl,
        });
      }
      return;
    }

    const kind = getMetaUrlKind(tag);
    if (kind) {
      const property = String(tag.property ?? tag.name ?? tag.itemProp ?? "").toLowerCase();
      locations.push({
        attribute: "content",
        kind,
        requireAbsolute: property === "og:url" || property === "twitter:url",
        requireHttps: property.endsWith(":secure_url"),
        source: createSource("meta", tag, "content", tagIndex),
        value: tag.content,
      });
    }
  });

  return locations;
};

const collectAttributeSources = (state: HelmetState): HelmetDiagnosticSource[] => {
  const sources: HelmetDiagnosticSource[] = [];
  const addAttributes = (
    tagName: HelmetDiagnosticTagName,
    tag: HelmetAttributes,
    tagIndex?: number,
  ) => {
    Object.keys(tag).forEach((attribute) => {
      sources.push(createSource(tagName, tag, attribute, tagIndex));
    });
  };

  addAttributes("bodyAttributes", state.bodyAttributes);
  addAttributes("htmlAttributes", state.htmlAttributes);
  addAttributes("titleAttributes", state.titleAttributes);

  (["base", "link", "meta", "noscript", "script", "style"] as const).forEach(
    (tagName) => {
      state[tagName].forEach((tag, tagIndex) =>
        addAttributes(tagName, tag, tagIndex),
      );
    },
  );

  return sources;
};

const isSuppressed = (
  id: HelmetSecurityRuleId,
  source: HelmetDiagnosticSource,
  suppressions: Array<HelmetSecurityRuleId | HelmetDiagnosticSuppression>,
) =>
  suppressions.some((suppression) => {
    if (typeof suppression === "string") {
      return suppression === id;
    }

    return (
      suppression.ruleId === id &&
      (suppression.tagName === undefined || suppression.tagName === source.tagName) &&
      (suppression.tagIndex === undefined || suppression.tagIndex === source.tagIndex) &&
      (suppression.attribute === undefined || suppression.attribute === source.attribute)
    );
  });

const defaultUrlSeverity = (
  id: HelmetSecurityRuleId,
  context: "raw" | "seo",
  location: UrlLocation,
): HelmetDiagnosticSeverity => {
  if (id === HELMET_SECURITY_RULE_IDS.DANGEROUS_URL_SCHEME) {
    return "error";
  }

  if (
    context === "seo" &&
    (id === HELMET_SECURITY_RULE_IDS.DATA_URL ||
      id === HELMET_SECURITY_RULE_IDS.BLOB_URL ||
      id === HELMET_SECURITY_RULE_IDS.CUSTOM_URL_SCHEME ||
      id === HELMET_SECURITY_RULE_IDS.UNEXPECTED_URL_SCHEME)
  ) {
    return "error";
  }

  if (
    location.kind === "refresh" ||
    (id === HELMET_SECURITY_RULE_IDS.DATA_URL && location.kind !== "image")
  ) {
    return "error";
  }

  return "warning";
};

const getUrlDiagnostic = (
  location: UrlLocation,
  context: "raw" | "seo",
): Omit<HelmetDiagnostic, "severity"> | undefined => {
  const classified = classifyUrl(location.value);

  if (classified.type === "dangerous") {
    return {
      id: HELMET_SECURITY_RULE_IDS.DANGEROUS_URL_SCHEME,
      message: `The ${location.source.tagName} ${location.attribute} uses the dangerous ${classified.scheme}: scheme.`,
      source: location.source,
      value: location.value,
    };
  }

  if (classified.type === "data") {
    return {
      id: HELMET_SECURITY_RULE_IDS.DATA_URL,
      message: `The ${location.source.tagName} ${location.attribute} uses a data: URL; allow it only when the tag context and payload are trusted.`,
      source: location.source,
      value: location.value,
    };
  }

  if (classified.type === "blob") {
    return {
      id: HELMET_SECURITY_RULE_IDS.BLOB_URL,
      message: `The ${location.source.tagName} ${location.attribute} uses a blob: URL whose lifetime and origin must be controlled by the application.`,
      source: location.source,
      value: location.value,
    };
  }

  if (classified.type === "protocol-relative") {
    return {
      id: HELMET_SECURITY_RULE_IDS.PROTOCOL_RELATIVE_URL,
      message: `The ${location.source.tagName} ${location.attribute} is protocol-relative; prefer an explicit https: URL.`,
      source: location.source,
      value: location.value,
    };
  }

  if (classified.type === "custom") {
    return {
      id: HELMET_SECURITY_RULE_IDS.CUSTOM_URL_SCHEME,
      message: `The ${location.source.tagName} ${location.attribute} uses the custom ${classified.scheme}: scheme.`,
      source: location.source,
      value: location.value,
    };
  }

  if (classified.type === "invalid") {
    return {
      id: HELMET_SECURITY_RULE_IDS.UNEXPECTED_URL_SCHEME,
      message: `The ${location.source.tagName} ${location.attribute} uses an unexpected or malformed URL scheme.`,
      source: location.source,
      value: location.value,
    };
  }

  if (
    context === "seo" &&
    location.requireAbsolute &&
    classified.type === "relative"
  ) {
    return {
      id: HELMET_SECURITY_RULE_IDS.UNEXPECTED_URL_SCHEME,
      message: `The ${location.source.tagName} ${location.attribute} requires an absolute http: or https: URL in the SEO policy.`,
      source: location.source,
      value: location.value,
    };
  }

  if (
    context === "seo" &&
    location.requireHttps &&
    classified.scheme !== "https"
  ) {
    return {
      id: HELMET_SECURITY_RULE_IDS.UNEXPECTED_URL_SCHEME,
      message: `The ${location.source.tagName} ${location.attribute} requires an https: URL in the SEO policy.`,
      source: location.source,
      value: location.value,
    };
  }

  return undefined;
};

const addDiagnostic = (
  diagnostics: HelmetDiagnostic[],
  diagnostic: Omit<HelmetDiagnostic, "severity">,
  defaultSeverity: HelmetDiagnosticSeverity,
  options: AuditHelmetStateOptions,
) => {
  const severity = options.severities?.[diagnostic.id] ?? defaultSeverity;
  if (
    severity === "off" ||
    isSuppressed(diagnostic.id, diagnostic.source, options.suppressions ?? [])
  ) {
    return;
  }

  diagnostics.push({ ...diagnostic, severity });
};

/**
 * Audits an already-reduced Helmet state. It reports problems but never rewrites
 * or sanitizes descriptors, so the same function can be used for client and SSR
 * state.
 */
export const auditHelmetState = (
  state: HelmetState,
  options: AuditHelmetStateOptions = {},
): HelmetAuditResult => {
  const context = options.context ?? "raw";
  const diagnostics: HelmetDiagnostic[] = [];

  collectUrlLocations(state).forEach((location) => {
    const diagnostic = getUrlDiagnostic(location, context);
    if (diagnostic) {
      addDiagnostic(
        diagnostics,
        diagnostic,
        defaultUrlSeverity(diagnostic.id, context, location),
        options,
      );
    }
  });

  collectAttributeSources(state).forEach((source) => {
    const value = source.tag[source.attribute];
    const normalizedName = decodeUrlForInspection(source.attribute)
      .replace(CONTROL_OR_SPACE_PATTERN, "")
      .toLowerCase();

    if (/^on[a-z]/.test(normalizedName) && typeof value === "string") {
      addDiagnostic(
        diagnostics,
        {
          id: HELMET_SECURITY_RULE_IDS.EVENT_HANDLER_ATTRIBUTE,
          message: `The ${source.tagName} descriptor contains the string event-handler attribute "${source.attribute}".`,
          source,
          value,
        },
        "error",
        options,
      );
      return;
    }

    if (
      !ATTRIBUTE_NAME_PATTERN.test(source.attribute) ||
      SUSPICIOUS_ATTRIBUTE_NAMES.has(normalizedName)
    ) {
      addDiagnostic(
        diagnostics,
        {
          id: HELMET_SECURITY_RULE_IDS.SUSPICIOUS_ATTRIBUTE_NAME,
          message: `The ${source.tagName} descriptor contains the suspicious attribute name "${source.attribute}".`,
          source,
          value: typeof value === "string" ? value : undefined,
        },
        "warning",
        options,
      );
    }
  });

  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error");
  const warnings = diagnostics.filter((diagnostic) => diagnostic.severity === "warning");
  const suggestions = diagnostics.filter(
    (diagnostic) => diagnostic.severity === "suggestion",
  );

  return {
    diagnostics,
    errors,
    suggestions,
    valid: errors.length === 0,
    warnings,
  };
};

/**
 * Returns whether a URL is safe for the high-level SEO helpers. Raw Helmet tags
 * intentionally do not call this function.
 */
export const isSafeSeoUrl = (
  value: string,
  options: { requireAbsolute?: boolean; requireHttps?: boolean } = {},
) => {
  const classified = classifyUrl(value);

  if (classified.type === "relative") {
    return !options.requireAbsolute;
  }

  if (classified.type !== "absolute") {
    return false;
  }

  return !options.requireHttps || classified.scheme === "https";
};
