import { updateTag } from "../core/HeadManager";
import { useEffect } from "react";

export const SecurityMeta = () => {
  useEffect(() => {
    updateTag("meta", {
      "http-equiv": "Content-Security-Policy",
      content: "default-src 'self'",
    });
    updateTag("meta", {
      "http-equiv": "X-Content-Type-Options",
      content: "nosniff",
    });
  }, []);

  return null;
};
