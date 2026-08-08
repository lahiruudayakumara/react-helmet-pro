import type { HelmetData } from "../core/HelmetData";
import type { AstroHeadCollection } from "../types/adapters";
import type { HelmetState, HelmetTagCollection } from "../types/tags";
import { extractXRobotsTagHeader } from "../utils/robotsBuilder";

export type { AstroHeadCollection };

const formatAttributes = (attrs: Record<string, any>): string => {
  return Object.entries(attrs)
    .filter(([_, val]) => val !== undefined && val !== null && val !== false)
    .map(([key, val]) => (val === true ? key : `${key}="${String(val).replace(/"/g, "&quot;")}"`))
    .join(" ");
};

export const collectAstroHead = (
  input?: HelmetData | HelmetState | HelmetTagCollection | Record<string, any>,
): AstroHeadCollection => {
  const collection: AstroHeadCollection = {
    bodyAttributes: {},
    htmlAttributes: {},
    link: [],
    meta: [],
    noscript: [],
    script: [],
    style: [],
    title: undefined,
    titleAttributes: {},
  };

  if (!input) {
    return collection;
  }

  let state: any = input;
  if (typeof state === "object" && state !== null && "getState" in state && typeof state.getState === "function") {
    state = state.getState();
  }

  if (state.title) {
    collection.title = state.title;
  }
  if (state.titleAttributes) {
    collection.titleAttributes = { ...state.titleAttributes };
  }
  if (state.htmlAttributes) {
    collection.htmlAttributes = { ...state.htmlAttributes };
  }
  if (state.bodyAttributes) {
    collection.bodyAttributes = { ...state.bodyAttributes };
  }

  if (Array.isArray(state.meta)) {
    collection.meta = state.meta.map((m: any) => ({ ...m }));
  }
  if (Array.isArray(state.link)) {
    collection.link = state.link.map((l: any) => ({ ...l }));
  }
  if (Array.isArray(state.script)) {
    collection.script = state.script.map((s: any) => ({ ...s }));
  }
  if (Array.isArray(state.style)) {
    collection.style = state.style.map((st: any) => ({ ...st }));
  }
  if (Array.isArray(state.noscript)) {
    collection.noscript = state.noscript.map((ns: any) => ({ ...ns }));
  }

  return collection;
};

export const renderAstroHeadToString = (
  input?: HelmetData | HelmetState | HelmetTagCollection | Record<string, any>,
): string => {
  const head = collectAstroHead(input);
  const htmlParts: string[] = [];

  if (head.title) {
    const attrsStr = formatAttributes(head.titleAttributes);
    htmlParts.push(`<title${attrsStr ? " " + attrsStr : ""}>${head.title}</title>`);
  }

  for (const m of head.meta) {
    const attrsStr = formatAttributes(m);
    htmlParts.push(`<meta${attrsStr ? " " + attrsStr : ""} />`);
  }

  for (const l of head.link) {
    const attrsStr = formatAttributes(l);
    htmlParts.push(`<link${attrsStr ? " " + attrsStr : ""} />`);
  }

  for (const st of head.style) {
    const { cssText, ...attrs } = st;
    const attrsStr = formatAttributes(attrs);
    htmlParts.push(`<style${attrsStr ? " " + attrsStr : ""}>${cssText ?? ""}</style>`);
  }

  for (const s of head.script) {
    const { innerHTML, ...attrs } = s;
    const attrsStr = formatAttributes(attrs);
    htmlParts.push(`<script${attrsStr ? " " + attrsStr : ""}>${innerHTML ?? ""}</script>`);
  }

  for (const ns of head.noscript) {
    const { innerHTML, ...attrs } = ns;
    const attrsStr = formatAttributes(attrs);
    htmlParts.push(`<noscript${attrsStr ? " " + attrsStr : ""}>${innerHTML ?? ""}</noscript>`);
  }

  return htmlParts.join("\n");
};

export const getAstroRobotsHeader = (
  input?: unknown,
): Record<string, string> => {
  return extractXRobotsTagHeader(input);
};
