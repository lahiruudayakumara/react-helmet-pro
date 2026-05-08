"use client";

import type {
  ArticleSchemaInput,
  ArticleSchemaPublisher,
  ArticleSchemaType,
  SchemaPerson,
} from "../utils/schemaBuilder";
import { buildArticleSchema } from "../utils/schemaBuilder";
import type { SeoImage, SeoOpenGraph, SeoProps } from "./Seo";
import { Seo } from "./Seo";

export interface ArticleSeoProps extends Omit<SeoProps, "author" | "openGraph" | "title"> {
  authors?: Array<string | SchemaPerson>;
  expirationTime?: string;
  images?: SeoImage[];
  modifiedTime?: string;
  openGraph?: Omit<
    SeoOpenGraph,
    "authors" | "expirationTime" | "images" | "modifiedTime" | "publishedTime" | "section" | "tags" | "type"
  >;
  publishedTime?: string;
  publisher?: ArticleSchemaPublisher;
  schemaType?: ArticleSchemaType;
  section?: string;
  tags?: string[];
  title: string;
}

const asArray = <T,>(value?: T | T[]) => {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const getAuthorName = (value: string | SchemaPerson) =>
  typeof value === "string" ? value : value.name;

export const ArticleSeo = ({
  authors,
  expirationTime,
  images,
  jsonLd,
  modifiedTime,
  openGraph,
  publishedTime,
  publisher,
  schemaType = "Article",
  section,
  tags,
  title,
  canonical,
  description,
  keywords,
  ...props
}: ArticleSeoProps) => {
  const authorNames = authors?.map(getAuthorName);
  const articleSchema: ArticleSchemaInput = {
    authors,
    dateModified: modifiedTime,
    datePublished: publishedTime,
    description,
    headline: title,
    image: images?.map((image) => image.url),
    inLanguage: props.locale,
    keywords,
    publisher,
    section,
    type: schemaType,
    url: canonical,
  };

  return (
    <Seo
      {...props}
      author={authorNames?.join(", ")}
      canonical={canonical}
      description={description}
      jsonLd={[buildArticleSchema(articleSchema), ...asArray(jsonLd)]}
      keywords={keywords}
      openGraph={{
        ...openGraph,
        authors: authorNames,
        expirationTime,
        images,
        modifiedTime,
        publishedTime,
        section,
        tags,
        type: "article",
      }}
      title={title}
    />
  );
};
