export const createTag = (type: string, props: Record<string, string>) => {
  const tag = document.createElement(type);
  Object.entries(props).forEach(([key, value]) => tag.setAttribute(key, value));
  return tag;
};