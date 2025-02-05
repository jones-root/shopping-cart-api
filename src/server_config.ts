import fastify, { FastifySchemaCompiler } from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import compress from "@fastify/compress";
import { AnySchema } from "yup";

import { IS_DEV } from "./constants.js";

const corsWhitelist = process.env.CORS_WHITELIST?.split(",") ?? [];

const yupValidatorCompiler: FastifySchemaCompiler<AnySchema> = ({ schema }) => {
  return (data) => {
    try {
      const result = schema.validateSync(data, {
        strict: true,
        abortEarly: true,
        stripUnknown: true,
        recursive: true,
      });
      return { value: result };
    } catch (error: any) {
      return { error };
    }
  };
};

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

  app.setValidatorCompiler(yupValidatorCompiler);

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

      callback(new Error("Not allowed by CORS"), false);
    },
  });

  app.setErrorHandler(async (error, req, reply) => {
    reply.status(error.statusCode ?? 500);
    reply.send(error);
  });

  return app;
}
