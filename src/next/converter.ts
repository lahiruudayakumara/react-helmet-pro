import type { HelmetProps, HelmetState, HelmetSeoDefaults } from "../types";
import { normalizeSeoUrl } from "../utils/urlNormalizer";
import { buildNextMetadata } from "./seo";
import type {
  GenerateMetadataFn,
  NextConverterOptions,
  NextMetadata,
  NextMetadataInput,
  ResolvingMetadata,
} from "./types";

export const helmetToNextMetadata = (
  input: HelmetProps | HelmetState,
  defaults?: HelmetSeoDefaults,
): NextMetadata => {
  const isState = "base" in input && Array.isArray((input as HelmetState).meta);

  const title = isState
    ? (input as HelmetState).title
    : (input as HelmetProps).title;

  const metaList = isState
    ? (input as HelmetState).meta ?? []
    : (input as HelmetProps).meta ?? [];

  const linkList = isState
    ? (input as HelmetState).link ?? []
    : (input as HelmetProps).link ?? [];

  const description = metaList.find((m) => m.name === "description")?.content;
  const canonical = linkList.find((l) => l.rel === "canonical")?.href;

  const languages: Record<string, string> = {};
  linkList.forEach((l) => {
    if (l.rel === "alternate" && typeof l.hreflang === "string" && typeof l.href === "string") {
      languages[l.hreflang] = l.href;
    }
  });

  const ogTitle = metaList.find((m) => m.property === "og:title")?.content;
  const ogDesc = metaList.find((m) => m.property === "og:description")?.content;
  const ogImage = metaList.find((m) => m.property === "og:image")?.content;
  const ogUrl = metaList.find((m) => m.property === "og:url")?.content;

  const twitterCard = metaList.find((m) => m.name === "twitter:card")?.content;
  const twitterTitle = metaList.find((m) => m.name === "twitter:title")?.content;

  const inputMetadata: NextMetadataInput = {
    title: title || defaults?.defaultTitle,
    description: description || defaults?.description,
    alternates: canonical || Object.keys(languages).length ? {
      canonical: canonical || undefined,
      languages: Object.keys(languages).length ? languages : undefined,
    } : undefined,
    openGraph: (ogTitle || ogDesc || ogImage || ogUrl) ? {
      title: ogTitle || title,
      description: ogDesc || description,
      images: ogImage ? [ogImage] : undefined,
      url: ogUrl || canonical,
    } : undefined,
    twitter: (twitterCard || twitterTitle) ? {
      card: twitterCard || "summary_large_image",
      title: twitterTitle || ogTitle || title,
    } : undefined,
  };

  return buildNextMetadata(inputMetadata);
};

export const nextMetadataToHelmet = (metadata: NextMetadata): HelmetProps => {
  const title = typeof metadata.title === "string"
    ? metadata.title
    : metadata.title?.default || metadata.title?.absolute;

  const titleTemplate = typeof metadata.title === "object" ? metadata.title.template : undefined;

  const meta: Array<{ name?: string; property?: string; content?: string }> = [];
  const link: Array<{ rel?: string; href?: string; hreflang?: string }> = [];

  if (metadata.description) {
    meta.push({ name: "description", content: metadata.description });
  }

  if (metadata.alternates?.canonical) {
    link.push({ rel: "canonical", href: String(metadata.alternates.canonical) });
  }

  if (metadata.alternates?.languages) {
    Object.entries(metadata.alternates.languages).forEach(([lang, href]) => {
      link.push({ rel: "alternate", hreflang: lang, href: String(href) });
    });
  }

  if (metadata.openGraph) {
    const og = metadata.openGraph;
    if (og.title) meta.push({ property: "og:title", content: og.title });
    if (og.description) meta.push({ property: "og:description", content: og.description });
    if (og.url) meta.push({ property: "og:url", content: String(og.url) });
    if (og.siteName) meta.push({ property: "og:site_name", content: og.siteName });

    if (og.images) {
      const images = Array.isArray(og.images) ? og.images : [og.images];
      images.forEach((img) => {
        const src = typeof img === "string" ? img : img.url;
        meta.push({ property: "og:image", content: String(src) });
      });
    }
  }

  if (metadata.twitter) {
    const tw = metadata.twitter;
    if (tw.card) meta.push({ name: "twitter:card", content: tw.card });
    if (tw.title) meta.push({ name: "twitter:title", content: tw.title });
    if (tw.description) meta.push({ name: "twitter:description", content: tw.description });
    if (tw.creator) meta.push({ name: "twitter:creator", content: tw.creator });
  }

  return {
    title,
    titleTemplate,
    meta,
    link,
  };
};

export const createGenerateMetadata = <TProps = Record<string, unknown>>(
  handler: GenerateMetadataFn<TProps>,
  options: NextConverterOptions = {},
): ((props: TProps, parent: ResolvingMetadata) => Promise<NextMetadata>) => {
  return async (props: TProps, parent: ResolvingMetadata): Promise<NextMetadata> => {
    const rawResult = await handler(props, parent);
    const builtMetadata = buildNextMetadata(rawResult);

    if (options.siteUrl && builtMetadata.alternates?.canonical) {
      const normalizedCanonical = normalizeSeoUrl(builtMetadata.alternates.canonical, {
        baseUrl: options.siteUrl,
      });

      builtMetadata.alternates.canonical = normalizedCanonical;
    }

    return builtMetadata;
  };
};
