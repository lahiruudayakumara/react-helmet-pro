"use client";

import React from "react";
import type { LocalBusinessSchemaInput } from "../types/schemas";
import { buildLocalBusinessSchema } from "../utils/schemaBuilder";
import { StructuredData } from "./StructuredData";

export interface LocalBusinessJsonLdProps {
  business: LocalBusinessSchemaInput;
  id?: string;
}

export const LocalBusinessJsonLd = ({ business, id }: LocalBusinessJsonLdProps) => (
  <StructuredData id={id} json={buildLocalBusinessSchema(business)} />
);
