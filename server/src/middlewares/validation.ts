/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas) => {
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.params) {
        request.params = await schemas.params.parseAsync(request.params);
      }
      if (schemas.query) {
        request.query = await schemas.query.parseAsync(request.query);
      }
      if (schemas.body) {
        request.body = await schemas.body.parseAsync(request.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        response.status(400).json({
          message: "Validation failed",
          errors: error.errors.map((errorItem) => ({
            path: errorItem.path.join("."),
            message: errorItem.message
          }))
        });
        return;
      }
      response.status(400).json({
        message: error instanceof Error ? error.message : "Invalid request"
      });
    }
  };
};
