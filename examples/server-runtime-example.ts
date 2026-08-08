import { expressHelmetMiddleware } from "react-helmet-pro/express";
import { fastifyHelmetPlugin } from "react-helmet-pro/fastify";
import { honoHelmetMiddleware } from "react-helmet-pro/hono";

// 1. Express Example
export function setupExpressApp(app: any) {
  app.use(
    expressHelmetMiddleware({
      autoXRobotsTag: true,
      robotsDirectives: {
        index: true,
        follow: true,
        maxImagePreview: "large",
      },
    }),
  );

  app.get("/", (req: any, res: any) => {
    // Access request-isolated helmetData instance via req.helmet or res.locals.helmet
    const helmetData = req.helmet;
    res.send(`<html><head>${helmetData ? "<!-- Head injected -->" : ""}</head><body>Hello</body></html>`);
  });
}

// 2. Fastify Example
export function setupFastifyApp(fastify: any) {
  fastify.register(
    fastifyHelmetPlugin({
      autoXRobotsTag: true,
    }),
  );

  fastify.get("/", async (request: any, reply: any) => {
    // request.helmet is isolated per request
    return { ok: true };
  });
}

// 3. Hono Example
export function setupHonoApp(app: any) {
  app.use(
    "*",
    honoHelmetMiddleware({
      autoXRobotsTag: true,
    }),
  );

  app.get("/", (c: any) => {
    const helmet = c.get("helmet");
    return c.text("Hono SSR with react-helmet-pro");
  });
}
