"use client";

import React, { useMemo, useState } from "react";

import { HelmetContext } from "./HelmetContext";

export const HelmetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [head, setHead] = useState<{
    title?: string;
    meta?: { name: string; content: string }[];
  }>({});
  const contextValue = useMemo(
    () => ({ setHead, title: head.title, meta: head.meta }),
    [setHead, head.title, head.meta]
  );
  return (
    <HelmetContext.Provider value={contextValue}>
      {children}
    </HelmetContext.Provider>
  );
};
