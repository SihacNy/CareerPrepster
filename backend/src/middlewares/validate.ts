import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export const validate =
  (schema: AnyZodObject, source: 'body' | 'query' | 'params' = 'body') =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          rule: err.code,
        }));

        logger.warn('Validation', `Invalid request payload on ${req.method} ${req.originalUrl}`, {
          source,
          errors: errorDetails,
          receivedData: req[source],
        });

        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Input validation failed. Please check the required fields.',
            details: errorDetails,
          },
        });
      }
      return next(error);
    }
  };
