import { FastifyError } from "fastify";
import {
  SchemaErrorDataVar,
  FastifySchemaValidationError,
} from "fastify/types/schema";

export class AppError extends Error implements FastifyError {
  constructor(error: Partial<FastifyError>) {
    super(error.message);
    Object.assign(this, error);
  }

  code!: string;
  name!: string;
  statusCode?: number | undefined;
  validationContext?: SchemaErrorDataVar | undefined;
  validation?: FastifySchemaValidationError[] | undefined;
  message!: string;
  stack?: string | undefined;
  cause?: unknown;
}
