import { JSX } from "react";

export const collectHelmetTags = (elements: JSX.Element[]) => {
  return elements.map((el, index) => ({ ...el, key: `head-tag-${index}` }));
};