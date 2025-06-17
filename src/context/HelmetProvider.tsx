"use client";

import React, { useMemo, useState } from "react";

import { HelmetContext } from "./HelmetContext";

export const HelmetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [head, setHead] = useState<{
    title?: string;
    meta?: { name?: string; property?: string; content: string }[];
    link?: { rel: string; href: string }[];
  }>({});
  const contextValue = useMemo(
    () => ({ setHead, title: head.title, meta: head.meta, link: head.link }),
    [setHead, head.title, head.meta, head.link]
  );
  return (
    <HelmetContext.Provider value={contextValue}>
      {children}
    </HelmetContext.Provider>
  );
};
