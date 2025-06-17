"use client";

import React, { useContext, useEffect } from "react";

import { HelmetContext } from "../context/HelmetContext";
import { updateTag } from "../core/HeadManager";

interface HelmetProps {
  title?: string;
  meta?: { name?: string; property?: string; content: string }[];
  link?: { rel: string; href: string }[];
  script?: { src: string; async?: boolean; defer?: boolean }[];
  htmlAttributes?: { [key: string]: string };
}

export const Helmet: React.FC<HelmetProps> = ({ title, meta, link, script }) => {
  const context = useContext(HelmetContext)!;

  useEffect(() => {
    if (title) {
      document.title = title;
    }
    const tags: HTMLElement[] = [];
    meta?.forEach((m) => {
      const tag = updateTag("meta", { name: m.name, property: m.property, content: m.content });
      tags.push(tag);
    });

    return () => {
      tags.forEach((tag) => tag.remove());
    };
  }, [title, meta]);

  useEffect(() => {
    context?.setHead({ 
      title, 
      meta: meta?.filter((m) => m.name !== undefined) as { name: string; content: string }[] 
    });
  }, [title, meta, context]);

  return null;
};
