import type { SchemaPerson } from "../utils/schemaBuilder";

export interface ReviewSchemaInput {
  author: string | SchemaPerson;
  datePublished?: string;
  description?: string;
  name?: string;
  reviewBody?: string;
  reviewRating: {
    bestRating?: number;
    ratingValue: number;
    worstRating?: number;
  };
}

export interface AggregateRatingSchemaInput {
  bestRating?: number;
  itemReviewedName?: string;
  ratingCount?: number;
  ratingValue: number;
  reviewCount?: number;
  worstRating?: number;
}

export interface OfferShippingDetailsInput {
  deliveryTime?: {
    cutoffTime?: string;
    handlingTime?: { maxValue?: number; minValue?: number; unitCode?: string };
    transitTime?: { maxValue?: number; minValue?: number; unitCode?: string };
  };
  shippingDestination?: {
    addressCountry: string;
    addressRegion?: string;
  };
  shippingRate?: {
    currency: string;
    value: number;
  };
}

export interface MerchantReturnPolicyInput {
  applicableCountry?: string;
  merchantReturnDays?: number;
  returnFees?: "https://schema.org/FreeReturn" | "https://schema.org/ReturnFeesCustomerResponsibility" | string;
  returnMethod?: "https://schema.org/ReturnByMail" | "https://schema.org/ReturnInStore" | string;
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow" | "https://schema.org/MerchantReturnNotPermitted" | "https://schema.org/MerchantReturnUnlimitedWindow" | string;
  url?: string;
}

export interface OfferSchemaInput {
  availability?: "https://schema.org/InStock" | "https://schema.org/OutOfStock" | "https://schema.org/PreOrder" | string;
  itemCondition?: "https://schema.org/NewCondition" | "https://schema.org/UsedCondition" | "https://schema.org/RefurbishedCondition" | string;
  price: number | string;
  priceCurrency: string;
  priceValidUntil?: string;
  seller?: string | { name: string };
  shippingDetails?: OfferShippingDetailsInput;
  hasMerchantReturnPolicy?: MerchantReturnPolicyInput;
  url?: string;
}

export interface AggregateOfferSchemaInput {
  highPrice?: number | string;
  lowPrice: number | string;
  offerCount?: number;
  offers?: OfferSchemaInput[];
  priceCurrency: string;
}

export interface ProductSchemaInput {
  aggregateRating?: AggregateRatingSchemaInput;
  brand?: string | { name: string };
  category?: string;
  color?: string;
  description?: string;
  gtin?: string;
  image?: string | string[];
  mpn?: string;
  name: string;
  offers?: OfferSchemaInput | AggregateOfferSchemaInput;
  reviews?: ReviewSchemaInput[];
  sku?: string;
  url?: string;
}

export interface ProductGroupSchemaInput {
  brand?: string | { name: string };
  description?: string;
  name: string;
  productGroupID: string;
  products: ProductSchemaInput[];
  url?: string;
  variesBy?: string[];
}

export interface LocalBusinessSchemaInput {
  address: {
    addressCountry: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode?: string;
    streetAddress: string;
  };
  description?: string;
  geo?: {
    latitude: number;
    longitude: number;
  };
  image?: string | string[];
  logo?: string;
  name: string;
  openingHours?: string | string[];
  priceRange?: string;
  telephone?: string;
  type?: string;
  url?: string;
}

export interface JobPostingSchemaInput {
  datePosted: string;
  description: string;
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "TEMPORARY" | "INTERN" | string | string[];
  hiringOrganization: {
    logo?: string;
    name: string;
    sameAs?: string;
  };
  jobLocation?: {
    addressCountry?: string;
    addressLocality?: string;
    addressRegion?: string;
    streetAddress?: string;
  };
  jobLocationType?: "TELECOMMUTE" | string;
  title: string;
  validThrough?: string;
  baseSalary?: {
    currency: string;
    unitText?: "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR";
    value: number | { maxValue?: number; minValue?: number; value?: number };
  };
}

export interface EventSchemaInput {
  description?: string;
  endDate?: string;
  eventAttendanceMode?: "https://schema.org/OfflineEventAttendanceMode" | "https://schema.org/OnlineEventAttendanceMode" | "https://schema.org/MixedEventAttendanceMode" | string;
  eventStatus?: "https://schema.org/EventScheduled" | "https://schema.org/EventCancelled" | "https://schema.org/EventPostponed" | string;
  image?: string | string[];
  location: string | { address?: string; name: string; url?: string };
  name: string;
  offers?: OfferSchemaInput | OfferSchemaInput[];
  organizer?: { name: string; url?: string };
  startDate: string;
  url?: string;
}

export interface RecipeSchemaInput {
  author?: string | SchemaPerson;
  cookTime?: string;
  datePublished?: string;
  description?: string;
  image: string | string[];
  name: string;
  prepTime?: string;
  recipeCategory?: string;
  recipeCuisine?: string;
  recipeIngredient: string[];
  recipeInstructions?: Array<string | { text: string }>;
  recipeYield?: string;
  totalTime?: string;
}

export interface VideoObjectSchemaInput {
  contentUrl?: string;
  description: string;
  duration?: string;
  embedUrl?: string;
  name: string;
  publication?: {
    isLiveBroadcast?: boolean;
    startDate?: string;
  };
  thumbnailUrl: string | string[];
  uploadDate: string;
}

export interface BroadcastEventSchemaInput {
  isLiveBroadcast?: boolean;
  name: string;
  startDate: string;
  video?: VideoObjectSchemaInput;
}

export interface SoftwareApplicationSchemaInput {
  applicationCategory?: string;
  downloadUrl?: string;
  name: string;
  offers?: OfferSchemaInput;
  operatingSystem?: string;
  price?: number | string;
  priceCurrency?: string;
  rating?: AggregateRatingSchemaInput;
  softwareVersion?: string;
}

export interface ProfilePageSchemaInput {
  mainEntity: {
    alternateName?: string;
    description?: string;
    image?: string;
    name: string;
    sameAs?: string[];
    type?: "Person" | "Organization";
  };
  name?: string;
  url?: string;
}

export interface DiscussionForumPostingSchemaInput {
  author: string | SchemaPerson;
  commentCount?: number;
  datePublished: string;
  headline: string;
  text?: string;
  url?: string;
}

export interface CourseInstanceSchemaInput {
  courseMode?: string;
  courseWorkload?: string;
  instructor?: string | SchemaPerson;
  startDate?: string;
}

export interface CourseSchemaInput {
  description?: string;
  hasCourseInstance?: CourseInstanceSchemaInput | CourseInstanceSchemaInput[];
  name: string;
  provider?: { name: string; url?: string };
}

export interface DatasetSchemaInput {
  description: string;
  license?: string;
  name: string;
  sameAs?: string;
  url?: string;
}
