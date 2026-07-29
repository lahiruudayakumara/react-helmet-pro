"use client";

import React from "react";
import type { EventSchemaInput } from "../types/schemas";
import { buildEventSchema } from "../utils/schemaBuilder";
import { StructuredData } from "./StructuredData";

export interface EventJsonLdProps {
  event: EventSchemaInput;
  id?: string;
}

export const EventJsonLd = ({ event, id }: EventJsonLdProps) => (
  <StructuredData id={id} json={buildEventSchema(event)} />
);
