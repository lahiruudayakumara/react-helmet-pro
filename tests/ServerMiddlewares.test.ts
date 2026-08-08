import { describe, expect, it, vi } from "vitest";
import { expressHelmetMiddleware } from "../src/server/express";
import { fastifyHelmetPlugin } from "../src/server/fastify";
import { honoHelmetMiddleware } from "../src/server/hono";
import { HelmetData } from "../src/core/HelmetData";

describe("Server Middlewares", () => {
  describe("Express Helmet Middleware", () => {
    it("creates request-isolated HelmetData, attaches X-Robots-Tag, and cleans up", () => {
      const middleware = expressHelmetMiddleware();
      const req: any = {};
      const setHeader = vi.fn();
      let closeHandler: (() => void) | undefined;
      const res: any = {
        locals: {},
        setHeader,
        end: function (...args: any[]) {},
        on: (event: string, handler: () => void) => {
          if (event === "close") closeHandler = handler;
        },
      };

      middleware(req, res, () => {});

      expect(req.helmet).toBeInstanceOf(HelmetData);
      expect(res.locals.helmet).toBe(req.helmet);

      req.helmet.getState = () => ({
        meta: [{ name: "robots", content: "noindex, nofollow" }],
      } as any);

      res.end();

      expect(setHeader).toHaveBeenCalledWith("X-Robots-Tag", "noindex, nofollow");
      expect(req.helmet).toBeUndefined();
      expect(res.locals.helmet).toBeUndefined();
    });
  });

  describe("Fastify Helmet Plugin", () => {
    it("attaches request.helmet on request and cleans up on response/error", () => {
      let onRequestHook: any;
      let onSendHook: any;
      let onResponseHook: any;
      let onErrorHook: any;

      const fastifyMock = {
        addHook: (event: string, fn: any) => {
          if (event === "onRequest") onRequestHook = fn;
          if (event === "onSend") onSendHook = fn;
          if (event === "onResponse") onResponseHook = fn;
          if (event === "onError") onErrorHook = fn;
        },
      };

      const plugin = fastifyHelmetPlugin();
      plugin(fastifyMock, {}, () => {});

      const request: any = {};
      onRequestHook(request, {}, () => {});
      expect(request.helmet).toBeInstanceOf(HelmetData);

      request.helmet.getState = () => ({
        meta: [{ name: "googlebot", content: "noarchive" }],
      } as any);

      const headerFn = vi.fn();
      const reply: any = { header: headerFn };
      onSendHook(request, reply, "", () => {});

      expect(headerFn).toHaveBeenCalledWith("X-Robots-Tag", "googlebot: noarchive");

      onResponseHook(request, reply, () => {});
      expect(request.helmet).toBeUndefined();
    });
  });

  describe("Hono Helmet Middleware", () => {
    it("sets request-scoped context in Hono c.set and cleans up in finally block", async () => {
      const middleware = honoHelmetMiddleware();
      const contextStore = new Map<string, any>();
      const headerFn = vi.fn();

      const c: any = {
        set: (key: string, val: any) => contextStore.set(key, val),
        get: (key: string) => contextStore.get(key),
        header: headerFn,
      };

      await middleware(c, async () => {
        const helmet = c.get("helmet");
        expect(helmet).toBeInstanceOf(HelmetData);
        helmet.getState = () => ({
          meta: [{ name: "robots", content: "noindex" }],
        } as any);
      });

      expect(headerFn).toHaveBeenCalledWith("X-Robots-Tag", "noindex");
      expect(c.get("helmet")).toBeUndefined();
    });
  });
});
