"use client";

import { createContext } from "react";

export interface HelmetContextType {
  setHead: (data: {
    title?: string;
    meta?: { name?: string; property?: string; content: string }[];
    link?: { rel: string; href: string }[];
  }) => void;
  title?: string;
  meta?: { name?: string; property?: string; content: string }[];
  link?: { rel: string; href: string }[];
}

export const HelmetContext = createContext<HelmetContextType | null>(null);