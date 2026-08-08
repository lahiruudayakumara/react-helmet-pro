import React from "react";
import {
  ImageSeo,
  LocalBusinessSeo,
  PaginationSeo,
  PaywalledSeo,
  ProductSeo,
  VideoSeo,
} from "react-helmet-pro";

// 1. E-Commerce Product Page
export function ProductPageExample() {
  return (
    <ProductSeo
      title="Pro Noise-Cancelling Headphones"
      description="Studio quality wireless headphones with active noise cancellation."
      canonical="https://example.com/products/pro-headphones"
      brand="AudioLabs"
      sku="AL-800"
      images={[
        {
          url: "https://example.com/images/headphones-front.jpg",
          alt: "Pro Headphones Front View",
        },
      ]}
      offers={[
        {
          price: 299.99,
          priceCurrency: "USD",
          availability: "InStock",
          itemCondition: "NewCondition",
          priceValidUntil: "2026-12-31",
        },
      ]}
      rating={{
        ratingValue: 4.9,
        ratingCount: 340,
      }}
      breadcrumbs={[
        { name: "Store", item: "https://example.com/store" },
        { name: "Headphones", item: "https://example.com/store/headphones" },
        { name: "Pro Headphones", item: "https://example.com/products/pro-headphones" },
      ]}
    />
  );
}

// 2. Local Business / Coffee Shop
export function LocalBusinessExample() {
  return (
    <LocalBusinessSeo
      name="Artisan Coffee Roasters"
      description="Specialty coffee roastery and espresso bar."
      businessType="CafeOrCoffeeShop"
      address={{
        streetAddress: "456 Market St",
        addressLocality: "San Francisco",
        addressRegion: "CA",
        postalCode: "94105",
        addressCountry: "US",
      }}
      geo={{
        latitude: 37.7892,
        longitude: -122.4014,
      }}
      telephone="+1-415-555-0123"
      priceRange="$$"
      openingHours={[
        { dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "06:30", closes: "17:00" },
        { dayOfWeek: ["Saturday", "Sunday"], opens: "07:30", closes: "16:00" },
      ]}
    />
  );
}

// 3. Media / Video Page
export function VideoPageExample() {
  return (
    <VideoSeo
      title="Building High-Performance React SSR Applications"
      description="Comprehensive walkthrough of modern React SSR techniques."
      thumbnailUrl="https://example.com/thumbs/react-ssr.jpg"
      contentUrl="https://example.com/videos/react-ssr.mp4"
      uploadDate="2026-08-08"
      duration="PT22M15S"
    />
  );
}

// 4. Image / Portfolio Page
export function ImagePortfolioExample() {
  return (
    <ImageSeo
      title="Golden Gate Bridge at Sunrise"
      imageUrl="https://example.com/gallery/golden-gate.jpg"
      creditText="Photo by Alex Rivera"
      creator="Alex Rivera"
      license="https://creativecommons.org/licenses/by/4.0/"
      acquireLicensePage="https://example.com/licensing/golden-gate"
    />
  );
}

// 5. Pagination & Search Results
export function CatalogPaginationExample({ page = 2 }: { page?: number }) {
  return (
    <PaginationSeo
      title="Search Results for Wireless Audio"
      baseUrl="https://example.com/search"
      currentPage={page}
      totalPages={8}
    />
  );
}

// 6. Paywalled / Premium Content Article
export function PremiumArticleExample() {
  return (
    <PaywalledSeo
      title="State of Web Architecture 2026"
      description="Exclusive deep-dive report into modern web app frameworks and SEO strategy."
      isAccessibleForFree={false}
      publisher={{
        name: "Web Engineering Review",
        logo: "https://example.com/logo.png",
      }}
      parts={[
        { cssSelector: ".free-abstract", isAccessibleForFree: true },
        { cssSelector: ".subscriber-body", isAccessibleForFree: false },
      ]}
    />
  );
}
