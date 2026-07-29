"use client";

import React from "react";
import type { DatasetSchemaInput } from "../types/schemas";
import { buildDatasetSchema } from "../utils/schemaBuilder";
import { StructuredData } from "./StructuredData";

export interface DatasetJsonLdProps {
  dataset: DatasetSchemaInput;
  id?: string;
}

export const DatasetJsonLd = ({ dataset, id }: DatasetJsonLdProps) => (
  <StructuredData id={id} json={buildDatasetSchema(dataset)} />
);
