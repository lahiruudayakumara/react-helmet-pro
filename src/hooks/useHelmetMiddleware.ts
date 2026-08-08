"use client";

import { DependencyList, useEffect } from "react";

import { HelmetDispatcher } from "../core/HelmetDispatcher";
import { useHelmet } from "./useHelmet";

export const useHelmetMiddleware = (
  middleware: (head: ReturnType<typeof useHelmet>) => Record<string, unknown> | void,
  deps: DependencyList = [],
) => {
  const helmet = useHelmet();

  useEffect(() => {
    const middlewareHead =
      helmet.dispatcher instanceof HelmetDispatcher
        ? {
            ...helmet.dispatcher.getMiddlewareState(),
            defaults: helmet.defaults,
            dispatcher: helmet.dispatcher,
            setHead: helmet.setHead,
          }
        : helmet;
    const nextState = middleware?.(middlewareHead);

    if (nextState && typeof nextState === "object") {
      helmet.setHead(nextState);
    }
  }, [helmet, middleware, ...deps]);
};
