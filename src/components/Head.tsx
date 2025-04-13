import React, { useContext, useEffect } from "react";

import { HelmetContext } from "../context/HelmetContext";
import { updateTag } from "../core/HeadManager";

interface HeadProps {
  title?: string;
  meta?: { name: string; content: string }[];
}

export const Head: React.FC<HeadProps> = ({ title, meta }) => {
  const context = useContext(HelmetContext)!;

  useEffect(() => {
    if (title) {
      document.title = title;
    }
    const tags: HTMLElement[] = [];
    meta?.forEach((m) => {
      const tag = updateTag("meta", m);
      tags.push(tag);
    });

    return () => {
      tags.forEach((tag) => tag.remove());
    };
  }, [title, meta]);

  useEffect(() => {
    context?.setHead({ title, meta });
  }, [title, meta, context]);

  return null;
};
