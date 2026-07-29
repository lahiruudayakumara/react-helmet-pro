"use client";

import React from "react";
import type { SoftwareApplicationSchemaInput } from "../types/schemas";
import { buildSoftwareApplicationSchema } from "../utils/schemaBuilder";
import { StructuredData } from "./StructuredData";

export interface SoftwareApplicationJsonLdProps {
  application: SoftwareApplicationSchemaInput;
  id?: string;
}

export const SoftwareApplicationJsonLd = ({
  application,
  id,
}: SoftwareApplicationJsonLdProps) => (
  <StructuredData id={id} json={buildSoftwareApplicationSchema(application)} />
);
