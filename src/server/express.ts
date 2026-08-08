import { HelmetData } from "../core/HelmetData";
import type { ServerHelmetMiddlewareOptions } from "../types/adapters";
import { extractXRobotsTagHeader } from "../utils/robotsBuilder";

export interface ExpressHelmetRequest {
  helmet?: HelmetData;
  [key: string]: any;
}

export const expressHelmetMiddleware = (options: ServerHelmetMiddlewareOptions = {}) => {
  return (req: ExpressHelmetRequest, res: any, next: (err?: any) => void) => {
    const helmetData = new HelmetData({});
    req.helmet = helmetData;
    if (res.locals) {
      res.locals.helmet = helmetData;
    }

    const autoXRobots = options.autoXRobotsTag !== false;

    const cleanup = () => {
      delete req.helmet;
      if (res.locals) {
        delete res.locals.helmet;
      }
    };

    const originalEnd = res.end;
    res.end = function (...args: any[]) {
      if (autoXRobots && !res.headersSent) {
        const robotsHeader = extractXRobotsTagHeader(options.robotsDirectives ?? helmetData);
        if (robotsHeader["X-Robots-Tag"]) {
          res.setHeader("X-Robots-Tag", robotsHeader["X-Robots-Tag"]);
        }
      }
      cleanup();
      return originalEnd.apply(this, args);
    };

    res.on?.("close", cleanup);
    res.on?.("error", cleanup);

    next();
  };
};
