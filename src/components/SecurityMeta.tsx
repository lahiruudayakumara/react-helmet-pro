"use client";

import { updateTag } from "../core/HelmetManager";
import { useEffect } from "react";

export const SecurityMeta = () => {
  const securityMetaTags = [
    {
      "http-equiv": "Content-Security-Policy",
      content: "default-src 'self'",
    },
    {
      "http-equiv": "X-Content-Type-Options",
      content: "nosniff",
    },
    {
      "http-equiv": "X-Frame-Options",
      content: "DENY",
    },
    {
      "http-equiv": "Referrer-Policy",
      content: "no-referrer",
    },
  ];

  useEffect(() => {
    const createdTags: HTMLElement[] = [];

    securityMetaTags.forEach((tagProps) => {
      const tag = updateTag("meta", tagProps);
      if (tag) createdTags.push(tag);
    });

    return () => {
      createdTags.forEach((tag) => tag.remove());
    };
  }, []);

  return null;
};
