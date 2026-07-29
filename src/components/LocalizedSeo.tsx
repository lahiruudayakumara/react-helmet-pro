"use client";

import React from "react";

import type { LocalizedSeoProps } from "../types/localized";
import { buildHreflangLinks, normalizeLocaleCode } from "../utils/localeNormalizer";
import { normalizeSeoUrl } from "../utils/urlNormalizer";
import { Seo } from "./Seo";

export const LocalizedSeo = ({
  autoSelfReference = true,
  autoXDefault = true,
  currentLocale,
  descriptionMap,
  locales,
  mediaAlternates,
  titleMap,
  urlPolicy,
  xDefault,
  ...props
}: LocalizedSeoProps) => {
  const normalizedCurrentLocale = normalizeLocaleCode(currentLocale);
  const currentLocaleUrl = locales[currentLocale] ?? locales[normalizedCurrentLocale];

  const canonicalUrl = currentLocaleUrl
    ? normalizeSeoUrl(currentLocaleUrl, urlPolicy)
    : undefined;

  const resolvedTitle =
    titleMap?.[currentLocale] ?? titleMap?.[normalizedCurrentLocale] ?? props.title;
  const resolvedDescription =
    descriptionMap?.[currentLocale] ??
    descriptionMap?.[normalizedCurrentLocale] ??
    props.description;

  const hreflangLinks = buildHreflangLinks(locales, {
    autoSelfReference,
    autoXDefault,
    currentLocale: normalizedCurrentLocale,
    urlPolicy,
    xDefault,
  });

  const allAlternates = mediaAlternates?.length
    ? [...hreflangLinks, ...mediaAlternates]
    : hreflangLinks;

  return (
    <Seo
      {...props}
      alternates={allAlternates}
      canonical={canonicalUrl}
      description={resolvedDescription}
      locale={normalizedCurrentLocale}
      title={resolvedTitle}
      urlPolicy={urlPolicy}
    />
  );
};
