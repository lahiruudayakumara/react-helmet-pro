export const appendSiteName = (head: any) => {
  if (head.title) {
    return { ...head, title: `${head.title} | MySite` };
  }
  return head;
};