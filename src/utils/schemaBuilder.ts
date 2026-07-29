import type {
  AggregateOfferSchemaInput,
  AggregateRatingSchemaInput,
  BroadcastEventSchemaInput,
  CourseInstanceSchemaInput,
  CourseSchemaInput,
  DatasetSchemaInput,
  DiscussionForumPostingSchemaInput,
  EventSchemaInput,
  JobPostingSchemaInput,
  LocalBusinessSchemaInput,
  MerchantReturnPolicyInput,
  OfferSchemaInput,
  OfferShippingDetailsInput,
  ProductGroupSchemaInput,
  ProductSchemaInput,
  ProfilePageSchemaInput,
  RecipeSchemaInput,
  ReviewSchemaInput,
  SoftwareApplicationSchemaInput,
  VideoObjectSchemaInput,
} from "../types/schemas";

export interface SchemaPerson {
  name: string;
  url?: string;
}

export interface ArticleSchemaPublisher {
  logo?: string;
  name: string;
}

export interface OrganizationAddress {
  addressCountry?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  streetAddress?: string;
}

export interface OrganizationContactPoint {
  areaServed?: string | string[];
  availableLanguage?: string | string[];
  contactOption?: string | string[];
  contactType: string;
  email?: string;
  telephone?: string;
}

export interface OrganizationSchemaInput {
  address?: OrganizationAddress;
  alternateName?: string | string[];
  contactPoints?: OrganizationContactPoint[];
  description?: string;
  email?: string;
  foundingDate?: string;
  legalName?: string;
  logo?: string;
  name: string;
  sameAs?: string[];
  telephone?: string;
  url?: string;
}

export interface WebSiteSchemaInput {
  alternateName?: string | string[];
  description?: string;
  inLanguage?: string | string[];
  name: string;
  url: string;
}

export type ArticleSchemaType = "Article" | "BlogPosting" | "NewsArticle";

export interface ArticleSchemaInput {
  authors?: Array<string | SchemaPerson>;
  dateModified?: string;
  datePublished?: string;
  description?: string;
  headline: string;
  image?: string | string[];
  inLanguage?: string;
  keywords?: string | string[];
  publisher?: ArticleSchemaPublisher;
  section?: string;
  type?: ArticleSchemaType;
  url?: string;
}

export interface BreadcrumbSchemaItem {
  item: string;
  name: string;
}

export interface FaqSchemaEntry {
  answer: string;
  question: string;
}

const compactObject = <T extends Record<string, unknown>>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as T;

const normalizeAuthor = (value: string | SchemaPerson) =>
  typeof value === "string"
    ? {
        "@type": "Person",
        name: value,
      }
    : compactObject({
        "@type": "Person",
        name: value.name,
        url: value.url,
      });

const toSingleOrArray = <T>(value: T[]) => (value.length === 1 ? value[0] : value);

export const buildSchema = <T extends Record<string, unknown>>(type: string, data: T) => ({
  "@context": "https://schema.org",
  "@type": type,
  ...data,
});

export const buildOrganizationSchema = ({
  address,
  alternateName,
  contactPoints,
  description,
  email,
  foundingDate,
  legalName,
  logo,
  name,
  sameAs,
  telephone,
  url,
}: OrganizationSchemaInput) =>
  buildSchema(
    "Organization",
    compactObject({
      address: address
        ? compactObject({
            "@type": "PostalAddress",
            addressCountry: address.addressCountry,
            addressLocality: address.addressLocality,
            addressRegion: address.addressRegion,
            postalCode: address.postalCode,
            streetAddress: address.streetAddress,
          })
        : undefined,
      alternateName,
      contactPoint: contactPoints?.length
        ? contactPoints.map((entry) =>
            compactObject({
              "@type": "ContactPoint",
              areaServed: entry.areaServed,
              availableLanguage: entry.availableLanguage,
              contactOption: entry.contactOption,
              contactType: entry.contactType,
              email: entry.email,
              telephone: entry.telephone,
            }),
          )
        : undefined,
      description,
      email,
      foundingDate,
      legalName,
      logo: logo
        ? {
            "@type": "ImageObject",
            url: logo,
          }
        : undefined,
      name,
      sameAs: sameAs?.length ? sameAs : undefined,
      telephone,
      url,
    }),
  );

export const buildWebSiteSchema = ({
  alternateName,
  description,
  inLanguage,
  name,
  url,
}: WebSiteSchemaInput) =>
  buildSchema(
    "WebSite",
    compactObject({
      alternateName,
      description,
      inLanguage,
      name,
      url,
    }),
  );

export const buildArticleSchema = ({
  authors,
  dateModified,
  datePublished,
  description,
  headline,
  image,
  inLanguage,
  keywords,
  publisher,
  section,
  type = "Article",
  url,
}: ArticleSchemaInput) =>
  buildSchema(
    type,
    compactObject({
      articleSection: section,
      author: authors?.length ? toSingleOrArray(authors.map(normalizeAuthor)) : undefined,
      dateModified,
      datePublished,
      description,
      headline,
      image,
      inLanguage,
      keywords,
      mainEntityOfPage: url
        ? {
            "@type": "WebPage",
            "@id": url,
          }
        : undefined,
      publisher: publisher
        ? compactObject({
            "@type": "Organization",
            logo: publisher.logo
              ? {
                  "@type": "ImageObject",
                  url: publisher.logo,
                }
              : undefined,
            name: publisher.name,
          })
        : undefined,
      url,
    }),
  );

export const buildBreadcrumbSchema = (items: BreadcrumbSchemaItem[]) =>
  buildSchema("BreadcrumbList", {
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: item.item,
      name: item.name,
      position: index + 1,
    })),
  });

export const buildFaqSchema = (entries: FaqSchemaEntry[]) =>
  buildSchema("FAQPage", {
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
      name: entry.question,
    })),
  });

// Expanded E-Commerce & Merchant Schemas
export const buildMerchantReturnPolicySchema = (input: MerchantReturnPolicyInput) =>
  compactObject({
    "@type": "MerchantReturnPolicy",
    applicableCountry: input.applicableCountry,
    merchantReturnDays: input.merchantReturnDays,
    returnFees: input.returnFees,
    returnMethod: input.returnMethod,
    returnPolicyCategory: input.returnPolicyCategory,
    url: input.url,
  });

export const buildOfferShippingDetailsSchema = (input: OfferShippingDetailsInput) =>
  compactObject({
    "@type": "OfferShippingDetails",
    deliveryTime: input.deliveryTime
      ? compactObject({
          "@type": "ShippingDeliveryTime",
          handlingTime: input.deliveryTime.handlingTime
            ? compactObject({
                "@type": "QuantitativeValue",
                maxValue: input.deliveryTime.handlingTime.maxValue,
                minValue: input.deliveryTime.handlingTime.minValue,
                unitCode: input.deliveryTime.handlingTime.unitCode ?? "DAY",
              })
            : undefined,
          transitTime: input.deliveryTime.transitTime
            ? compactObject({
                "@type": "QuantitativeValue",
                maxValue: input.deliveryTime.transitTime.maxValue,
                minValue: input.deliveryTime.transitTime.minValue,
                unitCode: input.deliveryTime.transitTime.unitCode ?? "DAY",
              })
            : undefined,
        })
      : undefined,
    shippingDestination: input.shippingDestination
      ? compactObject({
          "@type": "DefinedRegion",
          addressCountry: input.shippingDestination.addressCountry,
          addressRegion: input.shippingDestination.addressRegion,
        })
      : undefined,
    shippingRate: input.shippingRate
      ? compactObject({
          "@type": "MonetaryAmount",
          currency: input.shippingRate.currency,
          value: input.shippingRate.value,
        })
      : undefined,
  });

export const buildOfferSchema = (input: OfferSchemaInput) =>
  compactObject({
    "@type": "Offer",
    availability: input.availability ?? "https://schema.org/InStock",
    hasMerchantReturnPolicy: input.hasMerchantReturnPolicy
      ? buildMerchantReturnPolicySchema(input.hasMerchantReturnPolicy)
      : undefined,
    itemCondition: input.itemCondition,
    price: input.price,
    priceCurrency: input.priceCurrency,
    priceValidUntil: input.priceValidUntil,
    seller: input.seller
      ? typeof input.seller === "string"
        ? { "@type": "Organization", name: input.seller }
        : { "@type": "Organization", name: input.seller.name }
      : undefined,
    shippingDetails: input.shippingDetails
      ? buildOfferShippingDetailsSchema(input.shippingDetails)
      : undefined,
    url: input.url,
  });

export const buildAggregateOfferSchema = (input: AggregateOfferSchemaInput) =>
  compactObject({
    "@type": "AggregateOffer",
    highPrice: input.highPrice,
    lowPrice: input.lowPrice,
    offerCount: input.offerCount,
    offers: input.offers?.map(buildOfferSchema),
    priceCurrency: input.priceCurrency,
  });

export const buildReviewSchema = (input: ReviewSchemaInput) =>
  compactObject({
    "@type": "Review",
    author: normalizeAuthor(input.author),
    datePublished: input.datePublished,
    description: input.description,
    name: input.name,
    reviewBody: input.reviewBody,
    reviewRating: compactObject({
      "@type": "Rating",
      bestRating: input.reviewRating.bestRating ?? 5,
      ratingValue: input.reviewRating.ratingValue,
      worstRating: input.reviewRating.worstRating ?? 1,
    }),
  });

export const buildAggregateRatingSchema = (input: AggregateRatingSchemaInput) =>
  compactObject({
    "@type": "AggregateRating",
    bestRating: input.bestRating ?? 5,
    itemReviewed: input.itemReviewedName ? { "@type": "Thing", name: input.itemReviewedName } : undefined,
    ratingCount: input.ratingCount,
    ratingValue: input.ratingValue,
    reviewCount: input.reviewCount,
    worstRating: input.worstRating ?? 1,
  });

export const buildProductSchema = (input: ProductSchemaInput) =>
  buildSchema(
    "Product",
    compactObject({
      aggregateRating: input.aggregateRating
        ? buildAggregateRatingSchema(input.aggregateRating)
        : undefined,
      brand: input.brand
        ? typeof input.brand === "string"
          ? { "@type": "Brand", name: input.brand }
          : { "@type": "Brand", name: input.brand.name }
        : undefined,
      category: input.category,
      color: input.color,
      description: input.description,
      gtin: input.gtin,
      image: input.image,
      mpn: input.mpn,
      name: input.name,
      offers: input.offers
        ? "lowPrice" in input.offers
          ? buildAggregateOfferSchema(input.offers)
          : buildOfferSchema(input.offers)
        : undefined,
      review: input.reviews?.map(buildReviewSchema),
      sku: input.sku,
      url: input.url,
    }),
  );

export const buildProductGroupSchema = (input: ProductGroupSchemaInput) =>
  buildSchema(
    "ProductGroup",
    compactObject({
      brand: input.brand
        ? typeof input.brand === "string"
          ? { "@type": "Brand", name: input.brand }
          : { "@type": "Brand", name: input.brand.name }
        : undefined,
      description: input.description,
      hasVariant: input.products.map(buildProductSchema),
      name: input.name,
      productGroupID: input.productGroupID,
      url: input.url,
      variesBy: input.variesBy,
    }),
  );

// LocalBusiness & Jobs Schemas
export const buildLocalBusinessSchema = (input: LocalBusinessSchemaInput) =>
  buildSchema(
    input.type ?? "LocalBusiness",
    compactObject({
      address: compactObject({
        "@type": "PostalAddress",
        addressCountry: input.address.addressCountry,
        addressLocality: input.address.addressLocality,
        addressRegion: input.address.addressRegion,
        postalCode: input.address.postalCode,
        streetAddress: input.address.streetAddress,
      }),
      description: input.description,
      geo: input.geo
        ? compactObject({
            "@type": "GeoCoordinates",
            latitude: input.geo.latitude,
            longitude: input.geo.longitude,
          })
        : undefined,
      image: input.image,
      logo: input.logo,
      name: input.name,
      openingHours: input.openingHours,
      priceRange: input.priceRange,
      telephone: input.telephone,
      url: input.url,
    }),
  );

export const buildJobPostingSchema = (input: JobPostingSchemaInput) =>
  buildSchema(
    "JobPosting",
    compactObject({
      baseSalary: input.baseSalary
        ? compactObject({
            "@type": "MonetaryAmount",
            currency: input.baseSalary.currency,
            value: typeof input.baseSalary.value === "number"
              ? input.baseSalary.value
              : compactObject({
                  "@type": "QuantitativeValue",
                  maxValue: input.baseSalary.value.maxValue,
                  minValue: input.baseSalary.value.minValue,
                  unitText: input.baseSalary.unitText,
                  value: input.baseSalary.value.value,
                }),
          })
        : undefined,
      datePosted: input.datePosted,
      description: input.description,
      employmentType: input.employmentType,
      hiringOrganization: compactObject({
        "@type": "Organization",
        logo: input.hiringOrganization.logo,
        name: input.hiringOrganization.name,
        sameAs: input.hiringOrganization.sameAs,
      }),
      jobLocation: input.jobLocation
        ? compactObject({
            "@type": "Place",
            address: compactObject({
              "@type": "PostalAddress",
              addressCountry: input.jobLocation.addressCountry,
              addressLocality: input.jobLocation.addressLocality,
              addressRegion: input.jobLocation.addressRegion,
              streetAddress: input.jobLocation.streetAddress,
            }),
          })
        : undefined,
      jobLocationType: input.jobLocationType,
      title: input.title,
      validThrough: input.validThrough,
    }),
  );

// Event, Recipe & Media Schemas
export const buildEventSchema = (input: EventSchemaInput) =>
  buildSchema(
    "Event",
    compactObject({
      description: input.description,
      endDate: input.endDate,
      eventAttendanceMode: input.eventAttendanceMode ?? "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: input.eventStatus ?? "https://schema.org/EventScheduled",
      image: input.image,
      location: typeof input.location === "string"
        ? { "@type": "Place", name: input.location }
        : compactObject({
            "@type": "Place",
            address: input.location.address,
            name: input.location.name,
            url: input.location.url,
          }),
      name: input.name,
      offers: input.offers
        ? Array.isArray(input.offers)
          ? input.offers.map(buildOfferSchema)
          : buildOfferSchema(input.offers)
        : undefined,
      organizer: input.organizer
        ? compactObject({
            "@type": "Organization",
            name: input.organizer.name,
            url: input.organizer.url,
          })
        : undefined,
      startDate: input.startDate,
      url: input.url,
    }),
  );

export const buildRecipeSchema = (input: RecipeSchemaInput) =>
  buildSchema(
    "Recipe",
    compactObject({
      author: input.author ? normalizeAuthor(input.author) : undefined,
      cookTime: input.cookTime,
      datePublished: input.datePublished,
      description: input.description,
      image: input.image,
      name: input.name,
      prepTime: input.prepTime,
      recipeCategory: input.recipeCategory,
      recipeCuisine: input.recipeCuisine,
      recipeIngredient: input.recipeIngredient,
      recipeInstructions: input.recipeInstructions?.map((step) =>
        typeof step === "string"
          ? { "@type": "HowToStep", text: step }
          : { "@type": "HowToStep", text: step.text },
      ),
      recipeYield: input.recipeYield,
      totalTime: input.totalTime,
    }),
  );

export const buildVideoObjectSchema = (input: VideoObjectSchemaInput) =>
  buildSchema(
    "VideoObject",
    compactObject({
      contentUrl: input.contentUrl,
      description: input.description,
      duration: input.duration,
      embedUrl: input.embedUrl,
      name: input.name,
      publication: input.publication
        ? compactObject({
            "@type": "BroadcastEvent",
            isLiveBroadcast: input.publication.isLiveBroadcast,
            startDate: input.publication.startDate,
          })
        : undefined,
      thumbnailUrl: input.thumbnailUrl,
      uploadDate: input.uploadDate,
    }),
  );

export const buildBroadcastEventSchema = (input: BroadcastEventSchemaInput) =>
  buildSchema(
    "BroadcastEvent",
    compactObject({
      isLiveBroadcast: input.isLiveBroadcast ?? true,
      name: input.name,
      startDate: input.startDate,
      video: input.video ? buildVideoObjectSchema(input.video) : undefined,
    }),
  );

export const buildSoftwareApplicationSchema = (input: SoftwareApplicationSchemaInput) =>
  buildSchema(
    "SoftwareApplication",
    compactObject({
      aggregateRating: input.rating ? buildAggregateRatingSchema(input.rating) : undefined,
      applicationCategory: input.applicationCategory,
      downloadUrl: input.downloadUrl,
      name: input.name,
      offers: input.offers
        ? buildOfferSchema(input.offers)
        : input.price !== undefined && input.priceCurrency
          ? buildOfferSchema({ price: input.price, priceCurrency: input.priceCurrency })
          : undefined,
      operatingSystem: input.operatingSystem,
      softwareVersion: input.softwareVersion,
    }),
  );

// Community, Education & Data Schemas
export const buildProfilePageSchema = (input: ProfilePageSchemaInput) =>
  buildSchema(
    "ProfilePage",
    compactObject({
      mainEntity: compactObject({
        "@type": input.mainEntity.type ?? "Person",
        alternateName: input.mainEntity.alternateName,
        description: input.mainEntity.description,
        image: input.mainEntity.image,
        name: input.mainEntity.name,
        sameAs: input.mainEntity.sameAs,
      }),
      name: input.name,
      url: input.url,
    }),
  );

export const buildDiscussionForumPostingSchema = (input: DiscussionForumPostingSchemaInput) =>
  buildSchema(
    "DiscussionForumPosting",
    compactObject({
      author: normalizeAuthor(input.author),
      commentCount: input.commentCount,
      datePublished: input.datePublished,
      headline: input.headline,
      text: input.text,
      url: input.url,
    }),
  );

export const buildCourseSchema = (input: CourseSchemaInput) =>
  buildSchema(
    "Course",
    compactObject({
      description: input.description,
      hasCourseInstance: input.hasCourseInstance
        ? Array.isArray(input.hasCourseInstance)
          ? input.hasCourseInstance.map((inst) =>
              compactObject({
                "@type": "CourseInstance",
                courseMode: inst.courseMode,
                courseWorkload: inst.courseWorkload,
                instructor: inst.instructor ? normalizeAuthor(inst.instructor) : undefined,
                startDate: inst.startDate,
              }),
            )
          : compactObject({
              "@type": "CourseInstance",
              courseMode: input.hasCourseInstance.courseMode,
              courseWorkload: input.hasCourseInstance.courseWorkload,
              instructor: input.hasCourseInstance.instructor
                ? normalizeAuthor(input.hasCourseInstance.instructor)
                : undefined,
              startDate: input.hasCourseInstance.startDate,
            })
        : undefined,
      name: input.name,
      provider: input.provider
        ? compactObject({
            "@type": "Organization",
            name: input.provider.name,
            url: input.provider.url,
          })
        : undefined,
    }),
  );

export const buildDatasetSchema = (input: DatasetSchemaInput) =>
  buildSchema(
    "Dataset",
    compactObject({
      description: input.description,
      license: input.license,
      name: input.name,
      sameAs: input.sameAs,
      url: input.url,
    }),
  );
