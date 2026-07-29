"use client";

import React from "react";
import type { VideoObjectSchemaInput } from "../types/schemas";
import { buildVideoObjectSchema } from "../utils/schemaBuilder";
import { StructuredData } from "./StructuredData";

export interface VideoObjectJsonLdProps {
  id?: string;
  video: VideoObjectSchemaInput;
}

export const VideoObjectJsonLd = ({ id, video }: VideoObjectJsonLdProps) => (
  <StructuredData id={id} json={buildVideoObjectSchema(video)} />
);
