import { useEffect } from "react";

export const Favicon = ({ href }: { href: string }) => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = href;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [href]);

  return null;
};