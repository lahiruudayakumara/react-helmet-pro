"use client";

import React from "react";
import type { ProductGroupSchemaInput, ProductSchemaInput } from "../types/schemas";
import { buildProductGroupSchema, buildProductSchema } from "../utils/schemaBuilder";
import { StructuredData } from "./StructuredData";

export interface ProductJsonLdProps {
  id?: string;
  product: ProductSchemaInput;
}

export const ProductJsonLd = ({ id, product }: ProductJsonLdProps) => (
  <StructuredData id={id} json={buildProductSchema(product)} />
);

export interface ProductGroupJsonLdProps {
  id?: string;
  productGroup: ProductGroupSchemaInput;
}

export const ProductGroupJsonLd = ({ id, productGroup }: ProductGroupJsonLdProps) => (
  <StructuredData id={id} json={buildProductGroupSchema(productGroup)} />
);
