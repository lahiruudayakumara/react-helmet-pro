"use client";

import React from "react";
import type { JobPostingSchemaInput } from "../types/schemas";
import { buildJobPostingSchema } from "../utils/schemaBuilder";
import { StructuredData } from "./StructuredData";

export interface JobPostingJsonLdProps {
  id?: string;
  jobPosting: JobPostingSchemaInput;
}

export const JobPostingJsonLd = ({ id, jobPosting }: JobPostingJsonLdProps) => (
  <StructuredData id={id} json={buildJobPostingSchema(jobPosting)} />
);
