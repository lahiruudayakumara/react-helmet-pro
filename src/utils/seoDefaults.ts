import type { SeoImage, SeoOpenGraph, SeoProps, SeoRobotsDirectives, SeoTwitter, SeoVerification } from "../components/Seo";
import type { HelmetFallbackOptions, HelmetSeoDefaults, HelmetSocialImageDefaults } from "../types/defaults";
import type { UrlNormalizationOptions } from "../types/urlPolicy";
import { normalizeSeoUrl } from "./urlNormalizer";

export const normalizeSocialImage = (
  image?: string | HelmetSocialImageDefaults,
): HelmetSocialImageDefaults | undefined => {
  if (!image) {
    return undefined;
  }

  if (typeof image === "string") {
    return { url: image };
  }

  return { ...image };
};

export const resolveUrl = (
  url: string | URL,
  baseUrl?: string | URL,
  policy?: UrlNormalizationOptions,
): string => {
  const mergedPolicy: UrlNormalizationOptions = {
    ...(policy ?? {}),
    baseUrl: policy?.baseUrl ?? baseUrl,
  };

  return normalizeSeoUrl(url, mergedPolicy);
};

const mergeFallbackOptions = (
  parent?: HelmetFallbackOptions | boolean,
  child?: HelmetFallbackOptions | boolean,
): HelmetFallbackOptions | boolean | undefined => {
  if (child !== undefined) {
    if (typeof child === "boolean") {
      return child;
    }
    if (typeof parent === "boolean") {
      return parent ? child : false;
    }
    return { ...(parent ?? {}), ...child };
  }

  return parent;
};

const mergeRobots = (
  parent?: SeoRobotsDirectives,
  child?: SeoRobotsDirectives,
): SeoRobotsDirectives | undefined => {
  if (!parent && !child) {
    return undefined;
  }
  if (!parent) {
    return child;
  }
  if (!child) {
    return parent;
  }

  return {
    ...parent,
    ...child,
    googleBot: parent.googleBot || child.googleBot ? { ...(parent.googleBot ?? {}), ...(child.googleBot ?? {}) } : undefined,
    googleBotNews:
      parent.googleBotNews || child.googleBotNews
        ? { ...(parent.googleBotNews ?? {}), ...(child.googleBotNews ?? {}) }
        : undefined,
  };
};

const mergeVerification = (
  parent?: SeoVerification,
  child?: SeoVerification,
): SeoVerification | undefined => {
  if (!parent && !child) {
    return undefined;
  }
  if (!parent) {
    return child;
  }
  if (!child) {
    return parent;
  }

  const other = [...(parent.other ?? []), ...(child.other ?? [])];

  return {
    ...parent,
    ...child,
    other: other.length ? other : undefined,
  };
};

const mergeUrlPolicy = (
  parent?: UrlNormalizationOptions,
  child?: UrlNormalizationOptions,
): UrlNormalizationOptions | undefined => {
  if (!parent && !child) {
    return undefined;
  }
  if (!parent) {
    return child;
  }
  if (!child) {
    return parent;
  }

  return {
    ...parent,
    ...child,
    allowedQueryParams: child.allowedQueryParams ?? parent.allowedQueryParams,
    deniedQueryParams: child.deniedQueryParams ?? parent.deniedQueryParams,
  };
};

export const mergeSeoDefaults = (
  parent?: HelmetSeoDefaults,
  child?: HelmetSeoDefaults,
): HelmetSeoDefaults | undefined => {
  if (!parent) {
    return child ? { ...child } : undefined;
  }
  if (!child) {
    return parent ? { ...parent } : undefined;
  }

  const parentImage = normalizeSocialImage(child.socialImage ?? child.image) ?? normalizeSocialImage(parent.socialImage ?? parent.image);
  const parentBaseUrl = child.baseUrl ?? child.siteUrl ?? parent.baseUrl ?? parent.siteUrl;

  return {
    ...parent,
    ...child,
    baseUrl: parentBaseUrl,
    description: child.description ?? parent.description,
    fallbacks: mergeFallbackOptions(parent.fallbacks, child.fallbacks),
    image: parentImage,
    locale: child.locale ?? parent.locale,
    openGraph: parent.openGraph || child.openGraph ? { ...(parent.openGraph ?? {}), ...(child.openGraph ?? {}) } : undefined,
    robots: mergeRobots(parent.robots, child.robots),
    siteName: child.siteName ?? parent.siteName,
    siteUrl: parentBaseUrl,
    socialImage: parentImage,
    titleTemplate: child.titleTemplate ?? parent.titleTemplate,
    defaultTitle: child.defaultTitle ?? parent.defaultTitle,
    twitter: parent.twitter || child.twitter ? { ...(parent.twitter ?? {}), ...(child.twitter ?? {}) } : undefined,
    urlPolicy: mergeUrlPolicy(parent.urlPolicy, child.urlPolicy),
    verification: mergeVerification(parent.verification, child.verification),
  };
};

export const resolveFallbackFlags = (
  componentFallbacks?: HelmetFallbackOptions | boolean,
  componentDisableFallbacks?: boolean,
  providerFallbacks?: HelmetFallbackOptions | boolean,
): Required<HelmetFallbackOptions> => {
  if (componentDisableFallbacks === true) {
    return {
      canonical: false,
      locale: false,
      openGraph: false,
      twitter: false,
    };
  }

  const defaultFlags: Required<HelmetFallbackOptions> = {
    canonical: true,
    locale: true,
    openGraph: true,
    twitter: true,
  };

  const applyFallbackValue = (
    value: HelmetFallbackOptions | boolean | undefined,
    flags: Required<HelmetFallbackOptions>,
  ) => {
    if (value === undefined) {
      return;
    }
    if (typeof value === "boolean") {
      flags.canonical = value;
      flags.locale = value;
      flags.openGraph = value;
      flags.twitter = value;
    } else {
      if (value.canonical !== undefined) flags.canonical = value.canonical;
      if (value.locale !== undefined) flags.locale = value.locale;
      if (value.openGraph !== undefined) flags.openGraph = value.openGraph;
      if (value.twitter !== undefined) flags.twitter = value.twitter;
    }
  };

  const flags = { ...defaultFlags };
  applyFallbackValue(providerFallbacks, flags);
  applyFallbackValue(componentFallbacks, flags);

  return flags;
};

export const resolveSeoProps = (
  props: SeoProps,
  providerDefaults?: HelmetSeoDefaults,
): SeoProps => {
  const fallbackFlags = resolveFallbackFlags(
    props.fallbacks,
    props.disableFallbacks,
    providerDefaults?.fallbacks,
  );

  const resolvedUrlPolicy = mergeUrlPolicy(providerDefaults?.urlPolicy, props.urlPolicy);

  const resolvedSiteName = props.siteName ?? providerDefaults?.siteName;
  const resolvedTitleTemplate = props.titleTemplate ?? providerDefaults?.titleTemplate;
  const resolvedDefaultTitle = props.defaultTitle ?? providerDefaults?.defaultTitle;
  const resolvedLocale = props.locale ?? providerDefaults?.locale;
  const resolvedDescription = props.description ?? providerDefaults?.description;
  const resolvedBaseUrl = providerDefaults?.baseUrl ?? providerDefaults?.siteUrl;

  let resolvedCanonical = props.canonical;
  if (resolvedCanonical) {
    if ((resolvedBaseUrl || resolvedUrlPolicy) && fallbackFlags.canonical) {
      resolvedCanonical = resolveUrl(resolvedCanonical, resolvedBaseUrl, resolvedUrlPolicy);
    }
  } else if (resolvedBaseUrl && fallbackFlags.canonical) {
    resolvedCanonical = resolveUrl(resolvedBaseUrl, undefined, resolvedUrlPolicy);
  }

  const normalizedProviderImage = normalizeSocialImage(
    providerDefaults?.socialImage ?? providerDefaults?.image,
  );

  const resolvedRobots = mergeRobots(providerDefaults?.robots, props.robots);
  const resolvedVerification = mergeVerification(providerDefaults?.verification, props.verification);

  // Open Graph resolution
  const providerOg = providerDefaults?.openGraph;
  const componentOg = props.openGraph;
  const baseOg: SeoOpenGraph | undefined =
    providerOg || componentOg
      ? { ...(providerOg ?? {}), ...(componentOg ?? {}) }
      : undefined;

  let finalOg: SeoOpenGraph | undefined;

  if (fallbackFlags.openGraph) {
    const ogTitle = baseOg?.title ?? props.title ?? resolvedDefaultTitle;
    const ogDescription = baseOg?.description ?? resolvedDescription;
    const ogUrlRaw = baseOg?.url ?? resolvedCanonical;
    const ogUrl = ogUrlRaw ? resolveUrl(ogUrlRaw, resolvedBaseUrl, resolvedUrlPolicy) : undefined;
    const ogSiteName = baseOg?.siteName ?? resolvedSiteName;
    const ogLocale = baseOg?.locale ?? resolvedLocale;
    const ogType = baseOg?.type ?? "website";

    let ogImages: SeoImage[] | undefined = baseOg?.images;
    if ((!ogImages || !ogImages.length) && normalizedProviderImage) {
      ogImages = [
        {
          alt: normalizedProviderImage.alt,
          height: normalizedProviderImage.height,
          secureUrl: normalizedProviderImage.secureUrl ? resolveUrl(normalizedProviderImage.secureUrl, resolvedBaseUrl, resolvedUrlPolicy) : undefined,
          type: normalizedProviderImage.type,
          url: resolveUrl(normalizedProviderImage.url, resolvedBaseUrl, resolvedUrlPolicy),
          width: normalizedProviderImage.width,
        },
      ];
    } else if (ogImages?.length) {
      ogImages = ogImages.map((image) => ({
        ...image,
        secureUrl: image.secureUrl ? resolveUrl(image.secureUrl, resolvedBaseUrl, resolvedUrlPolicy) : undefined,
        url: resolveUrl(image.url, resolvedBaseUrl, resolvedUrlPolicy),
      }));
    }

    if (
      baseOg ||
      ogTitle ||
      ogDescription ||
      ogUrl ||
      ogSiteName ||
      ogLocale ||
      ogImages
    ) {
      finalOg = {
        ...baseOg,
        description: ogDescription,
        images: ogImages,
        locale: ogLocale,
        siteName: ogSiteName,
        title: ogTitle,
        type: ogType,
        url: ogUrl,
      };
    }
  } else if (baseOg) {
    finalOg = {
      ...baseOg,
      url: baseOg.url ? resolveUrl(baseOg.url, resolvedBaseUrl, resolvedUrlPolicy) : undefined,
    };
  }

  // Twitter resolution
  const providerTwitter = providerDefaults?.twitter;
  const componentTwitter = props.twitter;
  const baseTwitter: SeoTwitter | undefined =
    providerTwitter || componentTwitter
      ? { ...(providerTwitter ?? {}), ...(componentTwitter ?? {}) }
      : undefined;

  let finalTwitter: SeoTwitter | undefined;

  if (fallbackFlags.twitter) {
    const twTitle = baseTwitter?.title ?? finalOg?.title ?? props.title ?? resolvedDefaultTitle;
    const twDescription = baseTwitter?.description ?? finalOg?.description ?? resolvedDescription;

    let twImages: string[] | undefined = baseTwitter?.images;
    if (!twImages || !twImages.length) {
      if (finalOg?.images?.length) {
        twImages = finalOg.images.map((img) => img.url);
      } else if (normalizedProviderImage) {
        twImages = [resolveUrl(normalizedProviderImage.url, resolvedBaseUrl, resolvedUrlPolicy)];
      }
    } else {
      twImages = twImages.map((img) => resolveUrl(img, resolvedBaseUrl, resolvedUrlPolicy));
    }

    const twImageAlt =
      baseTwitter?.imageAlt ?? finalOg?.images?.[0]?.alt ?? normalizedProviderImage?.alt;
    const twCard =
      baseTwitter?.card ?? (twImages?.length ? "summary_large_image" : "summary");
    const twSite = baseTwitter?.site;
    const twCreator = baseTwitter?.creator;

    if (
      baseTwitter ||
      twTitle ||
      twDescription ||
      twImages ||
      twCard ||
      twSite ||
      twCreator
    ) {
      finalTwitter = {
        ...baseTwitter,
        card: twCard,
        creator: twCreator,
        description: twDescription,
        imageAlt: twImageAlt,
        images: twImages,
        site: twSite,
        title: twTitle,
      };
    }
  } else {
    finalTwitter = baseTwitter;
  }

  // Normalize alternate hreflang links if urlPolicy or baseUrl present
  const resolvedAlternates = props.alternates?.map((entry) => ({
    ...entry,
    href: resolveUrl(entry.href, resolvedBaseUrl, resolvedUrlPolicy),
  }));

  return {
    ...props,
    alternates: resolvedAlternates,
    canonical: resolvedCanonical,
    defaultTitle: resolvedDefaultTitle,
    description: resolvedDescription,
    locale: resolvedLocale,
    openGraph: finalOg,
    robots: resolvedRobots,
    siteName: resolvedSiteName,
    titleTemplate: resolvedTitleTemplate,
    twitter: finalTwitter,
    urlPolicy: resolvedUrlPolicy,
    verification: resolvedVerification,
  };
};
