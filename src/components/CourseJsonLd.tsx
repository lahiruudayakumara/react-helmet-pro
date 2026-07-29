"use client";

import React from "react";
import type { CourseSchemaInput } from "../types/schemas";
import { buildCourseSchema } from "../utils/schemaBuilder";
import { StructuredData } from "./StructuredData";

export interface CourseJsonLdProps {
  course: CourseSchemaInput;
  id?: string;
}

export const CourseJsonLd = ({ course, id }: CourseJsonLdProps) => (
  <StructuredData id={id} json={buildCourseSchema(course)} />
);
