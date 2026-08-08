import type { SchemaPerson } from "../utils/schemaBuilder";
import type { MerchantReturnPolicyInput, OfferShippingDetailsInput } from "./schemas";

export type { MerchantReturnPolicyInput, OfferShippingDetailsInput };

export interface ProductOfferItem {
  availability?: "InStock" | "OutOfStock" | "PreOrder" | "Discontinued" | "InStoreOnly" | "LimitedAvailability" | "OnlineOnly" | "SoldOut" | string;
  itemCondition?: "NewCondition" | "UsedCondition" | "RefurbishedCondition" | "DamagedCondition" | string;
  price: number | string;
  priceCurrency: string;
  priceValidUntil?: string;
  sellerName?: string;
  sku?: string;
  url?: string;
}

export interface ProductReviewInput {
  author: string | SchemaPerson;
  datePublished?: string;
  reviewBody?: string;
  reviewRating: number;
}

export interface LocalBusinessOpeningHours {
  closes?: string;
  dayOfWeek: string | string[];
  opens?: string;
}

export interface LocalBusinessGeoInput {
  latitude: number | string;
  longitude: number | string;
}

export interface LocalBusinessDepartmentInput {
  name: string;
  openingHours?: LocalBusinessOpeningHours[];
  telephone?: string;
}

export interface VideoClipInput {
  endOffset?: number;
  name: string;
  startOffset: number;
  url?: string;
}

export interface VideoSeekActionInput {
  target: string;
}

export interface VideoLiveStreamInput {
  endDate?: string;
  isLiveBroadcast?: boolean;
  startDate?: string;
}

export interface PaywallSectionInput {
  cssSelector: string;
  isAccessibleForFree: boolean;
}
