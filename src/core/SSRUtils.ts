import { JSX } from "react";

export const collectHeadTags = (elements: JSX.Element[]) => {
  return elements.map((el, index) => ({ ...el, key: `head-tag-${index}` }));
};