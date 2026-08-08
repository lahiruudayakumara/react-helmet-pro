"use client";

import type { PaywallSectionInput } from "../types/verticalSeo";
import type { ArticleSchemaPublisher } from "../utils/schemaBuilder";
import { buildPaywallSchema } from "../utils/schemaBuilder";
import type { SeoProps } from "./Seo";
import { Seo } from "./Seo";

export interface PaywalledSeoProps extends Omit<SeoProps, "title"> {
  extraSchema?: Record<string, any>;
  isAccessibleForFree?: boolean;
  parts?: PaywallSectionInput[];
  publisher?: ArticleSchemaPublisher;
  title: string;
}

const asArray = <T,>(value?: T | T[]) => {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
};

export const PaywalledSeo = ({
  extraSchema,
  isAccessibleForFree = false,
  jsonLd,
  parts = [],
  publisher,
  title,
  canonical,
  description,
  ...props
}: PaywalledSeoProps) => {
  const paywallSchema = buildPaywallSchema({
    description,
    hasPart: parts.map((part) => ({
      cssSelector: part.cssSelector,
      isAccessibleForFree: part.isAccessibleForFree,
    })),
    headline: title,
    isAccessibleForFree,
    publisher,
    url: canonical,
  });

  return (
    <Seo
      {...props}
      canonical={canonical}
      description={description}
      jsonLd={[paywallSchema, ...asArray(jsonLd)]}
      title={title}
    />
  );
};
