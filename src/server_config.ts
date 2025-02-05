import fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import compress from "@fastify/compress";
import { IS_DEV } from "./constants";

const corsWhitelist = process.env.CORS_WHITELIST?.split(",") ?? [];

export function createServer() {
  const app = fastify({
    logger: {
      level: "info",
      base: null,
      serializers: {
        req(request) {
          return {
            method: request.method,
            url: request.url,
            host: request.host,
          };
        },
      },
    },
  });

  app.register(compress);
  app.register(helmet);
  app.register(cors, {
    origin: (origin, callback) => {
      const hasValidCors =
        (IS_DEV && !origin) || corsWhitelist.includes(origin!);
      if (hasValidCors) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS Not allowed"), false);
    },
  });

  app.setErrorHandler(async (error, req, reply) => {
    if (error.message === "CORS Not allowed") {
      reply.status(403);
    }
    reply.send(error);
  });

  return app;
}
