"use client";

import React from "react";
import type { ProfilePageSchemaInput } from "../types/schemas";
import { buildProfilePageSchema } from "../utils/schemaBuilder";
import { StructuredData } from "./StructuredData";

export interface ProfilePageJsonLdProps {
  id?: string;
  profilePage: ProfilePageSchemaInput;
}

export const ProfilePageJsonLd = ({ id, profilePage }: ProfilePageJsonLdProps) => (
  <StructuredData id={id} json={buildProfilePageSchema(profilePage)} />
);
