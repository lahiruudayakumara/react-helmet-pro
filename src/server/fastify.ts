import { HelmetData } from "../core/HelmetData";
import type { ServerHelmetMiddlewareOptions } from "../types/adapters";
import { extractXRobotsTagHeader } from "../utils/robotsBuilder";

export interface FastifyHelmetRequest {
  helmet?: HelmetData;
  [key: string]: any;
}

export const fastifyHelmetPlugin = (options: ServerHelmetMiddlewareOptions = {}) => {
  return (fastify: any, _options: any, done: (err?: any) => void) => {
    const autoXRobots = options.autoXRobotsTag !== false;

    fastify.addHook("onRequest", (request: FastifyHelmetRequest, _reply: any, next: (err?: any) => void) => {
      request.helmet = new HelmetData({});
      next();
    });

    fastify.addHook("onSend", (request: FastifyHelmetRequest, reply: any, _payload: any, next: (err?: any) => void) => {
      if (autoXRobots && request.helmet) {
        const robotsHeader = extractXRobotsTagHeader(options.robotsDirectives ?? request.helmet);
        if (robotsHeader["X-Robots-Tag"]) {
          reply.header("X-Robots-Tag", robotsHeader["X-Robots-Tag"]);
        }
      }
      next();
    });

    fastify.addHook("onResponse", (request: FastifyHelmetRequest, _reply: any, next: (err?: any) => void) => {
      delete request.helmet;
      next();
    });

    fastify.addHook("onError", (request: FastifyHelmetRequest, _reply: any, _error: any, next: (err?: any) => void) => {
      delete request.helmet;
      next();
    });

    done();
  };
};
