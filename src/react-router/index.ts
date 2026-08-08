import type { HelmetData } from "../core/HelmetData";
import type { ReactRouterMetaDescriptor } from "../types/adapters";
import type { HelmetState, HelmetTagCollection } from "../types/tags";

export type { ReactRouterMetaDescriptor };

export const toReactRouterMeta = (
  input?: HelmetData | HelmetState | HelmetTagCollection | Record<string, any>,
): ReactRouterMetaDescriptor[] => {
  if (!input) {
    return [];
  }

  let state: any = input;
  if (typeof state === "object" && state !== null && "getState" in state && typeof state.getState === "function") {
    state = state.getState();
  }

  const descriptors: ReactRouterMetaDescriptor[] = [];

  if (state.title) {
    descriptors.push({ title: state.title });
  }

  if (Array.isArray(state.meta)) {
    for (const tag of state.meta) {
      if (!tag) continue;
      if (tag.charSet) {
        descriptors.push({ charSet: tag.charSet });
      } else if (tag.name) {
        descriptors.push({ name: tag.name, content: tag.content ?? "" });
      } else if (tag.property) {
        descriptors.push({ property: tag.property, content: tag.content ?? "" });
      } else if (tag.httpEquiv) {
        descriptors.push({ httpEquiv: tag.httpEquiv, content: tag.content ?? "" });
      } else {
        descriptors.push({ ...tag });
      }
    }
  }

  if (Array.isArray(state.script)) {
    for (const tag of state.script) {
      if (!tag) continue;
      if (tag.type === "application/ld+json" && tag.innerHTML) {
        try {
          const parsed = typeof tag.innerHTML === "string" ? JSON.parse(tag.innerHTML) : tag.innerHTML;
          descriptors.push({ "script:ld+json": parsed });
        } catch {
          descriptors.push({ name: "json-ld", content: tag.innerHTML });
        }
      }
    }
  }

  if (Array.isArray(state.link)) {
    for (const tag of state.link) {
      if (!tag) continue;
      descriptors.push({ tagName: "link", ...tag });
    }
  }

  return descriptors;
};

export const defineRouteSeo = <T = unknown>(
  seoConfigOrFactory: any | ((loaderData: T) => any),
) => {
  return (args: { data?: T; [key: string]: any }): ReactRouterMetaDescriptor[] => {
    const config = typeof seoConfigOrFactory === "function" ? seoConfigOrFactory(args.data as T) : seoConfigOrFactory;
    if (Array.isArray(config)) {
      return config;
    }
    return toReactRouterMeta(config);
  };
};

export const createReactRouterMeta = <T = unknown>(
  fn: (args: { data?: T; [key: string]: any }) => any,
) => {
  return (args: { data?: T; [key: string]: any }): ReactRouterMetaDescriptor[] => {
    const res = fn(args);
    if (Array.isArray(res)) {
      return res;
    }
    return toReactRouterMeta(res);
  };
};
