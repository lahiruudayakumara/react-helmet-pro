"use client";

import React, { useMemo } from "react";

import { safeJsonLdStringify } from "../next";
import { createJsonLdGraph } from "../utils/jsonLdGraph";
import { Helmet } from "./Helmet";

export interface StructuredDataGraphProps {
  /** Entities or sub-graphs to compose into the @graph JSON-LD structure */
  entities: Array<Record<string, unknown>>;
  /** Unique script element ID for stable hydration and navigation cleanup. Default: "rhp-jsonld-graph" */
  graphId?: string;
  /** Alias for graphId */
  id?: string;
}

export const StructuredDataGraph = ({
  entities,
  graphId = "rhp-jsonld-graph",
  id,
}: StructuredDataGraphProps) => {
  const graphObject = useMemo(() => {
    const graph = createJsonLdGraph(entities);
    return graph.toGraphObject();
  }, [entities]);

  const scriptId = id ?? graphId;

  return (
    <Helmet
      script={[
        {
          id: scriptId,
          innerHTML: safeJsonLdStringify(graphObject),
          type: "application/ld+json",
        },
      ]}
    />
  );
};
