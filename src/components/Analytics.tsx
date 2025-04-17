"use client";

import { useEffect } from "react";

export const Analytics = ({ type, id }: { type: "gtag"; id: string }) => {
  useEffect(() => {
    if (type === "gtag") {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(script);

      const inlineScript = document.createElement("script");
      inlineScript.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${id}');`;
      document.head.appendChild(inlineScript);
    }
  }, [type, id]);

  return null;
};
