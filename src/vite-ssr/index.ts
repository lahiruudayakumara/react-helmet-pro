import type { HelmetData } from "../core/HelmetData";
import type { ViteSsrInjectionOptions, ViteSsrStreamOptions } from "../types/adapters";
import type { HelmetState, HelmetTagCollection } from "../types/tags";
import { renderAstroHeadToString, collectAstroHead } from "../astro";

export type { ViteSsrInjectionOptions, ViteSsrStreamOptions };

const formatAttributes = (attrs: Record<string, any>): string => {
  return Object.entries(attrs)
    .filter(([_, val]) => val !== undefined && val !== null && val !== false)
    .map(([key, val]) => (val === true ? key : `${key}="${String(val).replace(/"/g, "&quot;")}"`))
    .join(" ");
};

export const injectHelmetIntoHtml = (
  htmlTemplate: string,
  input?: HelmetData | HelmetState | HelmetTagCollection | Record<string, any>,
  options: ViteSsrInjectionOptions = {},
): string => {
  let result = htmlTemplate;
  if (!input) {
    return result;
  }

  let state: any = input;
  if (typeof state === "object" && state !== null && "getState" in state && typeof state.getState === "function") {
    state = state.getState();
  }

  const collection = collectAstroHead(state);
  const headContent = renderAstroHeadToString(state);

  const headPlaceholder = options.headPlaceholder ?? "<!--helmet-head-->";
  const htmlAttrPlaceholder = options.htmlAttributesPlaceholder ?? "<!--helmet-html-attributes-->";
  const bodyAttrPlaceholder = options.bodyAttributesPlaceholder ?? "<!--helmet-body-attributes-->";

  // 1. HTML attributes
  const htmlAttrsStr = formatAttributes(collection.htmlAttributes);
  if (htmlAttrsStr) {
    if (result.includes(htmlAttrPlaceholder)) {
      result = result.replace(htmlAttrPlaceholder, htmlAttrsStr);
    } else {
      result = result.replace(/<html(\s|>)/i, `<html ${htmlAttrsStr}$1`);
    }
  } else if (result.includes(htmlAttrPlaceholder)) {
    result = result.replace(htmlAttrPlaceholder, "");
  }

  // 2. Body attributes
  const bodyAttrsStr = formatAttributes(collection.bodyAttributes);
  if (bodyAttrsStr) {
    if (result.includes(bodyAttrPlaceholder)) {
      result = result.replace(bodyAttrPlaceholder, bodyAttrsStr);
    } else {
      result = result.replace(/<body(\s|>)/i, `<body ${bodyAttrsStr}$1`);
    }
  } else if (result.includes(bodyAttrPlaceholder)) {
    result = result.replace(bodyAttrPlaceholder, "");
  }

  // 3. Head content
  if (result.includes(headPlaceholder)) {
    result = result.replace(headPlaceholder, headContent);
  } else if (result.includes("</head>")) {
    result = result.replace("</head>", `${headContent}\n</head>`);
  } else {
    result = `${headContent}\n${result}`;
  }

  return result;
};

/**
 * Creates a standard Web TransformStream for Vite SSR HTML streaming response handling.
 * Streamingly replaces `<!--helmet-head-flush-->` or `<!--helmet-flush-->` markers or injects
 * prioritized head tags before sending shell body chunks.
 */
export const createViteSsrStreamTransform = (
  input?: HelmetData | HelmetState | HelmetTagCollection | Record<string, any>,
  options: ViteSsrStreamOptions = {},
) => {
  const headContent = renderAstroHeadToString(input);
  const flushMarker = options.flushMarker ?? "<!--helmet-head-flush-->";
  let injected = false;

  return new TransformStream<string | Uint8Array, string>({
    transform(chunk, controller) {
      let chunkStr = typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);

      if (!injected) {
        if (chunkStr.includes(flushMarker)) {
          chunkStr = chunkStr.replace(flushMarker, headContent);
          injected = true;
        } else if (chunkStr.includes("</head>")) {
          chunkStr = chunkStr.replace("</head>", `${headContent}\n</head>`);
          injected = true;
        }
      }

      controller.enqueue(chunkStr);
    },
    flush(controller) {
      if (!injected && headContent) {
        controller.enqueue(headContent);
        injected = true;
      }
    },
  });
};
