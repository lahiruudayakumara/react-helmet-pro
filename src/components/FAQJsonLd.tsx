import type { FaqSchemaEntry } from "../utils/schemaBuilder";
import { buildFaqSchema } from "../utils/schemaBuilder";
import { StructuredData } from "./StructuredData";

export interface FAQJsonLdProps {
  entries: FaqSchemaEntry[];
  id?: string;
}

export const FAQJsonLd = ({ entries, id }: FAQJsonLdProps) => (
  <StructuredData id={id} json={buildFaqSchema(entries)} />
);
