"use client";

import React, { useEffect } from "react";

export const StructuredData = ({ json }: { json: object }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(json);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [json]);

  return null;
};
