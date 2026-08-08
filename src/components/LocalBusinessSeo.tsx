"use client";

import type {
  LocalBusinessDepartmentInput,
  LocalBusinessGeoInput,
  LocalBusinessOpeningHours,
} from "../types/verticalSeo";
import type { OrganizationAddress } from "../utils/schemaBuilder";
import { buildLocalBusinessSchema } from "../utils/schemaBuilder";
import type { SeoImage, SeoOpenGraph, SeoProps } from "./Seo";
import { Seo } from "./Seo";

export interface LocalBusinessSeoProps extends Omit<SeoProps, "openGraph" | "title"> {
  address?: OrganizationAddress;
  businessType?: string;
  departments?: LocalBusinessDepartmentInput[];
  extraSchema?: Record<string, any>;
  geo?: LocalBusinessGeoInput;
  images?: SeoImage[];
  name: string;
  openGraph?: Omit<SeoOpenGraph, "images" | "type">;
  openingHours?: LocalBusinessOpeningHours[];
  priceRange?: string;
  telephone?: string;
}

const asArray = <T,>(value?: T | T[]) => {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
};

const formatOpeningHours = (hoursList?: LocalBusinessOpeningHours[]): string[] | undefined => {
  if (!hoursList || hoursList.length === 0) return undefined;
  return hoursList.map((h) => {
    const days = Array.isArray(h.dayOfWeek) ? h.dayOfWeek.join(",") : h.dayOfWeek;
    if (h.opens && h.closes) {
      return `${days} ${h.opens}-${h.closes}`;
    }
    return days;
  });
};

export const LocalBusinessSeo = ({
  address,
  businessType = "LocalBusiness",
  departments,
  extraSchema,
  geo,
  images,
  jsonLd,
  name,
  openGraph,
  openingHours,
  priceRange,
  telephone,
  canonical,
  description,
  ...props
}: LocalBusinessSeoProps) => {
  const localBusinessSchema = buildLocalBusinessSchema({
    address,
    description,
    geo: geo ? { latitude: Number(geo.latitude), longitude: Number(geo.longitude) } : undefined,
    image: images?.map((img) => img.url),
    name,
    openingHours: formatOpeningHours(openingHours),
    priceRange,
    telephone,
    type: businessType,
    url: canonical,
  });

  const geoMeta: any[] = [];
  if (geo) {
    geoMeta.push({ name: "geo.position", content: `${geo.latitude};${geo.longitude}` });
    geoMeta.push({ name: "ICBM", content: `${geo.latitude}, ${geo.longitude}` });
    if (address?.addressRegion) {
      geoMeta.push({ name: "geo.region", content: address.addressRegion });
    }
  }

  return (
    <Seo
      {...props}
      canonical={canonical}
      description={description}
      extraMeta={[...geoMeta, ...(props.extraMeta ?? [])]}
      jsonLd={[localBusinessSchema, ...asArray(jsonLd)]}
      openGraph={{
        ...openGraph,
        images,
        type: "website",
      }}
      title={name}
    />
  );
};
