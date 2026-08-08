"use client";

import { buildPaginationLinks } from "../utils/pagination";
import type { SeoProps } from "./Seo";
import { Seo } from "./Seo";

export interface PaginationSeoProps extends Omit<SeoProps, "canonical"> {
  baseUrl: string;
  currentPage: number;
  paramName?: string;
  titleTemplate?: string;
  totalPages?: number;
}

export const PaginationSeo = ({
  baseUrl,
  currentPage,
  paramName = "page",
  titleTemplate,
  totalPages,
  description,
  title,
  ...props
}: PaginationSeoProps) => {
  const pagination = buildPaginationLinks({
    baseUrl,
    currentPage,
    paramName,
    titleTemplate,
    totalPages,
  });

  const paginationLinks: any[] = [];
  if (pagination.prevUrl) {
    paginationLinks.push({ rel: "prev", href: pagination.prevUrl });
  }
  if (pagination.nextUrl) {
    paginationLinks.push({ rel: "next", href: pagination.nextUrl });
  }

  const finalTitle = title ? (currentPage > 1 ? `${title} - Page ${currentPage}` : title) : (pagination.title ?? "");

  return (
    <Seo
      {...props}
      canonical={pagination.canonicalUrl}
      description={description}
      extraLink={[...paginationLinks, ...(props.extraLink ?? [])]}
      title={finalTitle}
    />
  );
};
