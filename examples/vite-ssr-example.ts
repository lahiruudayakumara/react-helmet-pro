import { createViteSsrStreamTransform, injectHelmetIntoHtml } from "react-helmet-pro/vite-ssr";
import { HelmetData } from "react-helmet-pro";

// Example 1: Full HTML Template String Injection
export function renderViteSsrHtml(template: string) {
  const helmetData = new HelmetData({});

  // Render app component into helmetData context...
  const helmetState = helmetData.getState();

  const finalHtml = injectHelmetIntoHtml(template, helmetState, {
    headPlaceholder: "<!--helmet-head-->",
    htmlAttributesPlaceholder: "<!--helmet-html-attributes-->",
    bodyAttributesPlaceholder: "<!--helmet-body-attributes-->",
  });

  return finalHtml;
}

// Example 2: Streaming HTML Injection using TransformStream
export function renderViteSsrStream(helmetData: HelmetData) {
  const streamTransform = createViteSsrStreamTransform(helmetData, {
    flushMarker: "<!--helmet-head-flush-->",
  });

  return streamTransform;
}
