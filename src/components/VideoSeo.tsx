"use client";

import type {
  VideoClipInput,
  VideoLiveStreamInput,
  VideoSeekActionInput,
} from "../types/verticalSeo";
import { buildVideoObjectSchema } from "../utils/schemaBuilder";
import type { SeoOpenGraph, SeoProps } from "./Seo";
import { Seo } from "./Seo";

export interface VideoSeoProps extends Omit<SeoProps, "openGraph"> {
  clips?: VideoClipInput[];
  contentUrl?: string;
  duration?: string;
  embedUrl?: string;
  extraSchema?: Record<string, any>;
  liveStream?: VideoLiveStreamInput;
  openGraph?: Omit<SeoOpenGraph, "type">;
  seekAction?: VideoSeekActionInput;
  thumbnailUrl: string;
  title: string;
  uploadDate: string;
}

const asArray = <T,>(value?: T | T[]) => {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
};

export const VideoSeo = ({
  clips,
  contentUrl,
  duration,
  embedUrl,
  extraSchema,
  jsonLd,
  liveStream,
  openGraph,
  seekAction,
  thumbnailUrl,
  title,
  uploadDate,
  canonical,
  description,
  ...props
}: VideoSeoProps) => {
  const videoSchema = buildVideoObjectSchema({
    contentUrl,
    description: description ?? title,
    duration,
    embedUrl,
    name: title,
    publication: liveStream,
    thumbnailUrl,
    uploadDate,
  });

  const videoMeta: any[] = [];
  if (contentUrl) {
    videoMeta.push({ property: "og:video", content: contentUrl });
    videoMeta.push({ property: "og:video:url", content: contentUrl });
    if (contentUrl.startsWith("https://")) {
      videoMeta.push({ property: "og:video:secure_url", content: contentUrl });
    }
  }

  return (
    <Seo
      {...props}
      canonical={canonical}
      description={description}
      extraMeta={[...videoMeta, ...(props.extraMeta ?? [])]}
      jsonLd={[videoSchema, ...asArray(jsonLd)]}
      openGraph={{
        ...openGraph,
        images: [{ url: thumbnailUrl }],
        type: "website",
      }}
      title={title}
    />
  );
};
