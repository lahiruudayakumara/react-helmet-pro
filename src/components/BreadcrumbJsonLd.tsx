import type { BreadcrumbSchemaItem } from "../utils/schemaBuilder";
import { buildBreadcrumbSchema } from "../utils/schemaBuilder";
import { StructuredData } from "./StructuredData";

export interface BreadcrumbJsonLdProps {
  id?: string;
  items: BreadcrumbSchemaItem[];
}

export const BreadcrumbJsonLd = ({ id, items }: BreadcrumbJsonLdProps) => (
  <StructuredData id={id} json={buildBreadcrumbSchema(items)} />
);
