import React from "react";

import type { ServerJsonLdProps } from "./types";

const HTML_ENTITY_REGEX = /</g;

export const safeJsonLdReplacer = (value: unknown): string =>
  JSON.stringify(value).replace(HTML_ENTITY_REGEX, "\\u003C");

export const ServerJsonLd: React.FC<ServerJsonLdProps> = ({
  id,
  nonce,
  schema,
}) => {
  const jsonString = safeJsonLdReplacer(schema);

  return (
    <script
      id={id}
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
};

export const renderServerJsonLd = (
  schema: Record<string, unknown> | Array<Record<string, unknown>>,
  options: { id?: string; nonce?: string } = {},
): string => {
  const jsonString = safeJsonLdReplacer(schema);
  const idAttr = options.id ? ` id="${options.id}"` : "";
  const nonceAttr = options.nonce ? ` nonce="${options.nonce}"` : "";

  return `<script${idAttr}${nonceAttr} type="application/ld+json">${jsonString}</script>`;
};
