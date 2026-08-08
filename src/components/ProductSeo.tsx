"use client";

import type {
  MerchantReturnPolicyInput,
  OfferShippingDetailsInput,
  ProductOfferItem,
  ProductReviewInput,
} from "../types/verticalSeo";
import type { BreadcrumbSchemaItem, SchemaPerson } from "../utils/schemaBuilder";
import { buildBreadcrumbSchema, buildProductSchema } from "../utils/schemaBuilder";
import type { SeoImage, SeoOpenGraph, SeoProps } from "./Seo";
import { Seo } from "./Seo";

export interface ProductSeoProps extends Omit<SeoProps, "openGraph" | "title"> {
  brand?: string | SchemaPerson;
  breadcrumbs?: BreadcrumbSchemaItem[];
  extraSchema?: Record<string, any>;
  images?: SeoImage[];
  offers?: ProductOfferItem | ProductOfferItem[];
  openGraph?: Omit<SeoOpenGraph, "images" | "type">;
  rating?: {
    bestRating?: number;
    ratingCount: number;
    ratingValue: number;
    worstRating?: number;
  };
  returnPolicy?: MerchantReturnPolicyInput;
  reviews?: ProductReviewInput[];
  shippingDetails?: OfferShippingDetailsInput;
  sku?: string;
  title: string;
}

const asArray = <T,>(value?: T | T[]) => {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
};

export const ProductSeo = ({
  brand,
  breadcrumbs,
  extraSchema,
  images,
  jsonLd,
  offers,
  openGraph,
  rating,
  returnPolicy,
  reviews,
  shippingDetails,
  sku,
  title,
  canonical,
  description,
  ...props
}: ProductSeoProps) => {
  const offerList = asArray(offers);
  const primaryOffer = offerList[0];

  const formattedOffers = offerList.length > 0 ? (
    offerList.length === 1
      ? {
          availability: primaryOffer.availability,
          itemCondition: primaryOffer.itemCondition,
          price: primaryOffer.price,
          priceCurrency: primaryOffer.priceCurrency,
          priceValidUntil: primaryOffer.priceValidUntil,
          seller: primaryOffer.sellerName ? { name: primaryOffer.sellerName } : undefined,
          url: primaryOffer.url ?? canonical,
        }
      : offerList.map((off) => ({
          availability: off.availability,
          itemCondition: off.itemCondition,
          price: off.price,
          priceCurrency: off.priceCurrency,
          priceValidUntil: off.priceValidUntil,
          seller: off.sellerName ? { name: off.sellerName } : undefined,
          url: off.url ?? canonical,
        }))
  ) : undefined;

  const productSchema = buildProductSchema({
    aggregateRating: rating,
    brand: typeof brand === "string" ? { name: brand } : brand,
    description,
    image: images?.map((img) => img.url),
    name: title,
    offers: formattedOffers as any,
    reviews: reviews?.map((rev) => ({
      author: rev.author,
      datePublished: rev.datePublished,
      reviewBody: rev.reviewBody,
      reviewRating: {
        ratingValue: rev.reviewRating,
      },
    })),
    sku,
    url: canonical,
  });

  const schemas: any[] = [productSchema];
  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push(buildBreadcrumbSchema(breadcrumbs));
  }

  const openGraphExtraMeta: any[] = [];
  if (primaryOffer) {
    if (primaryOffer.price !== undefined) {
      openGraphExtraMeta.push({ property: "og:price:amount", content: String(primaryOffer.price) });
    }
    if (primaryOffer.priceCurrency) {
      openGraphExtraMeta.push({ property: "og:price:currency", content: primaryOffer.priceCurrency });
    }
    if (primaryOffer.availability) {
      openGraphExtraMeta.push({ property: "product:availability", content: primaryOffer.availability });
    }
  }

  return (
    <Seo
      {...props}
      canonical={canonical}
      description={description}
      extraMeta={[...openGraphExtraMeta, ...(props.extraMeta ?? [])]}
      jsonLd={[...schemas, ...asArray(jsonLd)]}
      openGraph={{
        ...openGraph,
        images,
        type: "website",
      }}
      title={title}
    />
  );
};
