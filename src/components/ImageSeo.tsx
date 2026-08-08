"use client";

import type { SchemaPerson } from "../utils/schemaBuilder";
import { buildImageObjectSchema } from "../utils/schemaBuilder";
import type { SeoProps } from "./Seo";
import { Seo } from "./Seo";

export interface ImageSeoProps extends SeoProps {
  acquireLicensePage?: string;
  caption?: string;
  copyrightNotice?: string;
  creator?: string | SchemaPerson;
  creditText?: string;
  extraSchema?: Record<string, any>;
  imageUrl: string;
  license?: string;
  title: string;
}

const asArray = <T,>(value?: T | T[]) => {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
};

export const ImageSeo = ({
  acquireLicensePage,
  caption,
  copyrightNotice,
  creator,
  creditText,
  extraSchema,
  imageUrl,
  jsonLd,
  license,
  title,
  canonical,
  description,
  ...props
}: ImageSeoProps) => {
  const imageSchema = buildImageObjectSchema({
    acquireLicensePage,
    caption,
    contentUrl: imageUrl,
    copyrightNotice,
    creator,
    creditText,
    description: description ?? title,
    license,
    name: title,
  });

  return (
    <Seo
      {...props}
      canonical={canonical}
      description={description}
      jsonLd={[imageSchema, ...asArray(jsonLd)]}
      openGraph={{
        images: [{ url: imageUrl }],
        type: "website",
      }}
      title={title}
    />
  );
};
