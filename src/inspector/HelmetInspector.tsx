"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auditHelmetState } from "../core/auditHelmetState";
import type { HelmetAuditResult, HelmetDiagnostic } from "../types/diagnostics";
import type { HelmetState } from "../types/tags";
import { HelmetContext } from "../context/HelmetContext";

// ─── Inspector is excluded from production bundles ─────────────────────────

if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
  throw new Error(
    "[react-helmet-pro] HelmetInspector must not be imported in production. " +
    "Use a dynamic import with a dev check:\n" +
    "  if (process.env.NODE_ENV !== 'production') { import('react-helmet-pro/inspector') }",
  );
}

// ─── History Entry ──────────────────────────────────────────────────────────

export interface InspectorHistoryEntry {
  audit: HelmetAuditResult;
  state: HelmetState;
  timestamp: number;
  url: string;
}

// ─── Social Preview ─────────────────────────────────────────────────────────

const OgPreview: React.FC<{ state: HelmetState }> = ({ state }) => {
  const title = state.meta.find((m) => m.property === "og:title")?.content ?? state.title ?? "No title";
  const desc = state.meta.find((m) => m.property === "og:description")?.content ?? "";
  const image = state.meta.find((m) => m.property === "og:image")?.content;
  const url = state.meta.find((m) => m.property === "og:url")?.content ?? "";

  return (
    <div style={styles.ogCard}>
      {image ? (
        <img src={image} alt="OG Preview" style={styles.ogImage} />
      ) : (
        <div style={styles.ogImagePlaceholder}>No og:image</div>
      )}
      <div style={styles.ogContent}>
        <div style={styles.ogUrl}>{url}</div>
        <div style={styles.ogTitle}>{title}</div>
        <div style={styles.ogDesc}>{desc || "No og:description"}</div>
      </div>
    </div>
  );
};

const TwitterPreview: React.FC<{ state: HelmetState }> = ({ state }) => {
  const title = state.meta.find((m) => m.name === "twitter:title")?.content ?? state.title ?? "No title";
  const desc = state.meta.find((m) => m.name === "twitter:description")?.content ?? "";
  const image = state.meta.find((m) => m.name === "twitter:image")?.content;
  const card = state.meta.find((m) => m.name === "twitter:card")?.content ?? "summary";

  return (
    <div style={styles.ogCard}>
      {image && card !== "summary" ? (
        <img src={image} alt="Twitter Preview" style={styles.ogImage} />
      ) : null}
      <div style={styles.ogContent}>
        <div style={styles.ogUrl}>twitter:{card}</div>
        <div style={styles.ogTitle}>{title}</div>
        <div style={styles.ogDesc}>{desc || "No twitter:description"}</div>
      </div>
    </div>
  );
};

// ─── Diagnostic Badge ───────────────────────────────────────────────────────

const DiagBadge: React.FC<{ diag: HelmetDiagnostic }> = ({ diag }) => {
  const color =
    diag.severity === "error"
      ? "#ef4444"
      : diag.severity === "warning"
        ? "#f59e0b"
        : "#60a5fa";
  return (
    <div style={{ ...styles.diagBadge, borderLeftColor: color }}>
      <span style={{ color, fontWeight: 700, fontSize: 11 }}>
        {diag.severity.toUpperCase()}
      </span>{" "}
      <span style={styles.diagId}>[{diag.id}]</span>
      <div style={styles.diagMsg}>{diag.message}</div>
    </div>
  );
};

// ─── HelmetInspector ────────────────────────────────────────────────────────

type Tab = "overview" | "social" | "schema" | "diagnostics" | "history";

export interface HelmetInspectorProps {
  /** Maximum number of history entries to retain. Default: 20. */
  maxHistory?: number;
  /** Initial position of the inspector panel. Default: "bottom-right". */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export const HelmetInspector: React.FC<HelmetInspectorProps> = ({
  maxHistory = 20,
  position = "bottom-right",
}) => {
  const ctx = useContext(HelmetContext);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [history, setHistory] = useState<InspectorHistoryEntry[]>([]);

  // Stable primitive deps to avoid effect firing on new object identity every render
  const ctxTitle = ctx?.title;
  const ctxMetaLen = ctx?.meta.length ?? 0;
  const ctxLinkLen = ctx?.link.length ?? 0;
  const ctxScriptLen = ctx?.script.length ?? 0;

  // Memoize the state shape so we don't create a new object on every render
  const state: HelmetState | null = useMemo(
    () =>
      ctx
        ? {
            base: ctx.base,
            bodyAttributes: ctx.bodyAttributes,
            defer: ctx.defer,
            encodeSpecialCharacters: ctx.encodeSpecialCharacters,
            htmlAttributes: ctx.htmlAttributes,
            link: ctx.link,
            meta: ctx.meta,
            noscript: ctx.noscript,
            prioritizeSeoTags: ctx.prioritizeSeoTags,
            script: ctx.script,
            style: ctx.style,
            title: ctx.title,
            titleAttributes: ctx.titleAttributes,
          }
        : null,
    // Only recompute when real head data changes (stable primitives)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctxTitle, ctxMetaLen, ctxLinkLen, ctxScriptLen],
  );

  // Memoize audit result to avoid re-running on every render
  const audit = useMemo(
    () =>
      state
        ? auditHelmetState(state, { context: "seo" })
        : { diagnostics: [], errors: [], warnings: [], suggestions: [], valid: true },
    [state],
  );

  useEffect(() => {
    if (!state) return;
    const entry: InspectorHistoryEntry = {
      state: { ...state, meta: [...state.meta], link: [...state.link] },
      audit,
      timestamp: Date.now(),
      url: typeof window !== "undefined" ? window.location.href : "unknown",
    };
    // Use functional update to avoid stale closure; maxHistory is a stable prop
    setHistory((h) => [entry, ...h].slice(0, maxHistory));
    // Only fire when actual head content changes (stable primitive deps)
  }, [state, audit, maxHistory]);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  const positionStyle: React.CSSProperties =
    position === "bottom-right"
      ? { bottom: 16, right: 16 }
      : position === "bottom-left"
        ? { bottom: 16, left: 16 }
        : position === "top-right"
          ? { top: 16, right: 16 }
          : { top: 16, left: 16 };

  const errorCount = audit.errors.length;
  const warnCount = audit.warnings.length;

  return (
    <div style={{ ...styles.root, ...positionStyle }}>
      {/* Toggle FAB */}
      <button
        aria-label="Toggle React Helmet Pro Inspector"
        onClick={toggle}
        style={styles.fab}
        title="React Helmet Pro Inspector"
      >
        <span style={styles.fabLabel}>RHP</span>
        {(errorCount > 0 || warnCount > 0) && (
          <span style={{ ...styles.fabBadge, background: errorCount > 0 ? "#ef4444" : "#f59e0b" }}>
            {errorCount > 0 ? errorCount : warnCount}
          </span>
        )}
      </button>

      {open && state && (
        <div style={styles.panel} role="dialog" aria-label="React Helmet Pro Inspector">
          {/* Header */}
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>⚙ React Helmet Pro Inspector</span>
            <button
              aria-label="Close inspector"
              onClick={toggle}
              style={styles.closeBtn}
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div style={styles.tabBar}>
            {(["overview", "social", "schema", "diagnostics", "history"] as Tab[]).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{ ...styles.tabBtn, ...(tab === t ? styles.tabBtnActive : {}) }}
                >
                  {t === "diagnostics"
                    ? `Diagnostics (${audit.diagnostics.length})`
                    : t === "history"
                      ? `History (${history.length})`
                      : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ),
            )}
          </div>

          {/* Content */}
          <div style={styles.tabContent}>
            {tab === "overview" && (
              <table style={styles.table}>
                <tbody>
                  <Row label="Title" value={state.title ?? "—"} />
                  <Row
                    label="Description"
                    value={
                      state.meta.find((m) => m.name === "description")?.content ?? "—"
                    }
                  />
                  <Row
                    label="Canonical"
                    value={
                      state.link.find((l) => l.rel === "canonical")?.href ?? "—"
                    }
                  />
                  <Row
                    label="Robots"
                    value={
                      state.meta.find((m) => m.name === "robots")?.content ?? "—"
                    }
                  />
                  <Row
                    label="OG Title"
                    value={
                      state.meta.find((m) => m.property === "og:title")?.content ?? "—"
                    }
                  />
                  <Row
                    label="OG Type"
                    value={
                      state.meta.find((m) => m.property === "og:type")?.content ?? "—"
                    }
                  />
                  <Row label="Meta tags" value={String(state.meta.length)} />
                  <Row label="Link tags" value={String(state.link.length)} />
                  <Row
                    label="JSON-LD scripts"
                    value={String(
                      state.script.filter(
                        (s) => s.type === "application/ld+json",
                      ).length,
                    )}
                  />
                  <Row
                    label="Status"
                    value={audit.valid ? "✓ Valid" : `✖ ${errorCount} error(s)`}
                    valueColor={audit.valid ? "#4ade80" : "#ef4444"}
                  />
                </tbody>
              </table>
            )}

            {tab === "social" && (
              <div>
                <div style={styles.sectionLabel}>Open Graph</div>
                <OgPreview state={state} />
                <div style={{ ...styles.sectionLabel, marginTop: 12 }}>Twitter / X</div>
                <TwitterPreview state={state} />
              </div>
            )}

            {tab === "schema" && (
              <div>
                {state.script
                  .filter((s) => s.type === "application/ld+json")
                  .map((s, i) => {
                    let parsed: unknown = null;
                    try {
                      parsed = JSON.parse(s.innerHTML ?? "{}");
                    } catch {
                      // ignore parse errors
                    }
                    return (
                      <pre key={i} style={styles.codeBlock}>
                        {JSON.stringify(parsed, null, 2)}
                      </pre>
                    );
                  })}
                {state.script.filter((s) => s.type === "application/ld+json")
                  .length === 0 && (
                  <div style={styles.emptyMsg}>No JSON-LD scripts found.</div>
                )}
              </div>
            )}

            {tab === "diagnostics" && (
              <div>
                {audit.diagnostics.length === 0 ? (
                  <div style={styles.emptyMsg}>✓ No diagnostics</div>
                ) : (
                  audit.diagnostics.map((d, i) => (
                    <DiagBadge key={i} diag={d} />
                  ))
                )}
              </div>
            )}

            {tab === "history" && (
              <div>
                {history.length === 0 ? (
                  <div style={styles.emptyMsg}>No navigation history yet.</div>
                ) : (
                  history.map((entry, i) => (
                    <div key={i} style={styles.historyEntry}>
                      <div style={styles.historyUrl}>{entry.url}</div>
                      <div style={styles.historyMeta}>
                        {new Date(entry.timestamp).toLocaleTimeString()} ·{" "}
                        {entry.state.title ?? "—"} ·{" "}
                        {entry.audit.diagnostics.length} diagnostic(s)
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Row helper ─────────────────────────────────────────────────────────────

const Row: React.FC<{
  label: string;
  value: string;
  valueColor?: string;
}> = ({ label, value, valueColor }) => (
  <tr>
    <td style={styles.rowLabel}>{label}</td>
    <td style={{ ...styles.rowValue, ...(valueColor ? { color: valueColor } : {}) }}>
      {value}
    </td>
  </tr>
);

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "fixed",
    zIndex: 99999,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 13,
  },
  fab: {
    position: "relative",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    border: "none",
    borderRadius: "50%",
    width: 48,
    height: 48,
    cursor: "pointer",
    color: "#fff",
    fontWeight: 700,
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(99,102,241,0.5)",
    transition: "transform 0.15s ease",
  },
  fabLabel: {
    letterSpacing: "0.05em",
  },
  fabBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
  },
  panel: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 12,
    boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
    width: 380,
    maxHeight: 520,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    color: "#e2e8f0",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #1e293b",
    background: "linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%)",
  },
  panelTitle: {
    fontWeight: 700,
    fontSize: 13,
    color: "#a5b4fc",
    letterSpacing: "0.02em",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
    fontSize: 14,
    padding: "2px 6px",
    borderRadius: 4,
  },
  tabBar: {
    display: "flex",
    gap: 2,
    padding: "8px 12px",
    borderBottom: "1px solid #1e293b",
    overflowX: "auto",
    flexShrink: 0,
  },
  tabBtn: {
    background: "none",
    border: "1px solid transparent",
    borderRadius: 6,
    color: "#64748b",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 8px",
    whiteSpace: "nowrap",
    transition: "all 0.1s ease",
  },
  tabBtnActive: {
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#a5b4fc",
  },
  tabContent: {
    flex: 1,
    overflowY: "auto",
    padding: 12,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  rowLabel: {
    color: "#94a3b8",
    padding: "5px 0",
    width: "40%",
    verticalAlign: "top",
    fontSize: 12,
  },
  rowValue: {
    color: "#e2e8f0",
    padding: "5px 0",
    fontSize: 12,
    wordBreak: "break-all",
  },
  sectionLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 6,
  },
  ogCard: {
    background: "#1e293b",
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid #334155",
  },
  ogImage: {
    width: "100%",
    height: 100,
    objectFit: "cover",
    display: "block",
  },
  ogImagePlaceholder: {
    width: "100%",
    height: 60,
    background: "#334155",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: 12,
  },
  ogContent: {
    padding: "8px 10px",
  },
  ogUrl: {
    color: "#64748b",
    fontSize: 11,
    marginBottom: 2,
  },
  ogTitle: {
    fontWeight: 700,
    color: "#e2e8f0",
    fontSize: 13,
    marginBottom: 2,
  },
  ogDesc: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 1.4,
  },
  diagBadge: {
    borderLeft: "3px solid",
    padding: "6px 8px",
    marginBottom: 6,
    background: "#1e293b",
    borderRadius: "0 6px 6px 0",
    fontSize: 12,
  },
  diagId: {
    color: "#64748b",
    fontSize: 11,
  },
  diagMsg: {
    marginTop: 2,
    color: "#cbd5e1",
    lineHeight: 1.4,
  },
  codeBlock: {
    background: "#1e293b",
    borderRadius: 6,
    padding: "8px 10px",
    fontSize: 11,
    overflowX: "auto",
    color: "#7dd3fc",
    marginBottom: 8,
    lineHeight: 1.5,
  },
  emptyMsg: {
    color: "#4ade80",
    fontSize: 13,
    textAlign: "center",
    padding: "20px 0",
  },
  historyEntry: {
    padding: "6px 0",
    borderBottom: "1px solid #1e293b",
  },
  historyUrl: {
    color: "#a5b4fc",
    fontSize: 12,
    wordBreak: "break-all",
  },
  historyMeta: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
  },
};
