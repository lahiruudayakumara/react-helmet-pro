export interface PaginationOptions {
  baseUrl: string;
  currentPage: number;
  paramName?: string;
  titleTemplate?: string;
  totalPages?: number;
}

export interface PaginationResult {
  canonicalUrl: string;
  nextUrl?: string;
  prevUrl?: string;
  title?: string;
}

export const buildPaginationLinks = (options: PaginationOptions): PaginationResult => {
  const { baseUrl, currentPage, totalPages, paramName = "page", titleTemplate } = options;

  const url = new URL(baseUrl, "https://example.com");
  const isDefaultOrigin = url.origin === "https://example.com" && !baseUrl.startsWith("http");

  const buildUrl = (p: number) => {
    const targetUrl = new URL(baseUrl, "https://example.com");
    if (p <= 1) {
      targetUrl.searchParams.delete(paramName);
    } else {
      targetUrl.searchParams.set(paramName, String(p));
    }
    return isDefaultOrigin ? `${targetUrl.pathname}${targetUrl.search}` : targetUrl.toString();
  };

  const canonicalUrl = buildUrl(currentPage);
  const prevUrl = currentPage > 1 ? buildUrl(currentPage - 1) : undefined;
  const nextUrl = totalPages === undefined || currentPage < totalPages ? buildUrl(currentPage + 1) : undefined;

  let title: string | undefined;
  if (titleTemplate && totalPages) {
    title = titleTemplate.replace("%page%", String(currentPage)).replace("%total%", String(totalPages));
  } else if (titleTemplate) {
    title = titleTemplate.replace("%page%", String(currentPage));
  } else if (totalPages) {
    title = `Page ${currentPage} of ${totalPages}`;
  } else if (currentPage > 1) {
    title = `Page ${currentPage}`;
  }

  return {
    canonicalUrl,
    nextUrl,
    prevUrl,
    title,
  };
};
