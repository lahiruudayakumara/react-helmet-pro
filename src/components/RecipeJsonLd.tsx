"use client";

import React from "react";
import type { RecipeSchemaInput } from "../types/schemas";
import { buildRecipeSchema } from "../utils/schemaBuilder";
import { StructuredData } from "./StructuredData";

export interface RecipeJsonLdProps {
  id?: string;
  recipe: RecipeSchemaInput;
}

export const RecipeJsonLd = ({ id, recipe }: RecipeJsonLdProps) => (
  <StructuredData id={id} json={buildRecipeSchema(recipe)} />
);
