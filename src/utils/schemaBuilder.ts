export interface SchemaPerson {
  name: string;
  url?: string;
}

export interface ArticleSchemaPublisher {
  logo?: string;
  name: string;
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
