import { HelmetData } from "../core/HelmetData";
import type { ServerHelmetMiddlewareOptions } from "../types/adapters";
import { extractXRobotsTagHeader } from "../utils/robotsBuilder";

export const honoHelmetMiddleware = (options: ServerHelmetMiddlewareOptions = {}) => {
  const autoXRobots = options.autoXRobotsTag !== false;

  return async (c: any, next: () => Promise<void>) => {
    const helmetData = new HelmetData({});
    c.set("helmet", helmetData);

    try {
      await next();

      if (autoXRobots) {
        const robotsHeader = extractXRobotsTagHeader(options.robotsDirectives ?? helmetData);
        if (robotsHeader["X-Robots-Tag"]) {
          c.header("X-Robots-Tag", robotsHeader["X-Robots-Tag"]);
        }
      }
    } finally {
      c.set("helmet", undefined);
    }
  };
};
