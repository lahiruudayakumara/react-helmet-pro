import React, { createContext } from "react";

export interface HelmetContextType {
  setHead: (data: {
    title?: string;
    meta?: { name: string; content: string }[];
  }) => void;
  title?: string;
  meta?: { name: string; content: string }[];
}

export const HelmetContext = createContext<HelmetContextType | null>(null);
