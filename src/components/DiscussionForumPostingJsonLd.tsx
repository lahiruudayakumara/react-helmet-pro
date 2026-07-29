"use client";

import React from "react";
import type { DiscussionForumPostingSchemaInput } from "../types/schemas";
import { buildDiscussionForumPostingSchema } from "../utils/schemaBuilder";
import { StructuredData } from "./StructuredData";

export interface DiscussionForumPostingJsonLdProps {
  forumPosting: DiscussionForumPostingSchemaInput;
  id?: string;
}

export const DiscussionForumPostingJsonLd = ({
  forumPosting,
  id,
}: DiscussionForumPostingJsonLdProps) => (
  <StructuredData id={id} json={buildDiscussionForumPostingSchema(forumPosting)} />
);
