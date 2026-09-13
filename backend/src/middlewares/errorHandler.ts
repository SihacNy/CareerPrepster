import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const reqContext = {
    method: req.method,
    url: req.originalUrl || req.url,
    userId: req.user?.userId,
    query: req.query,
    body: req.body,
  };

  // 1. Handled AppError (e.g., 400 Validation, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Scanned PDF)
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.critical(
        'AppError',
        `Server failure [${err.code}]: ${err.message}`,
        err,
        reqContext
      );
    } else {
      logger.warn(
        'AppError',
        `Client issue [${err.code}]: ${err.message} (${err.statusCode})`,
        { ...reqContext, details: err.details }
      );
    }

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // 2. Multer file upload errors
  if (err.name === 'MulterError') {
    logger.warn('MulterUpload', `Upload rejected: ${err.message}`, {
      ...reqContext,
      multerCode: (err as any).code,
    });

    if ((err as any).code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'Uploaded file exceeds the maximum 5MB size limit.',
        },
      });
    }

    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message,
      },
    });
  }

  // 3. Unhandled runtime errors (500 Critical)
  logger.critical(
    'UnhandledException',
    `Uncaught runtime exception on ${req.method} ${req.originalUrl}: ${err.message}`,
    err,
    reqContext
  );

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        env.NODE_ENV === 'development'
          ? `Internal Server Error: ${err.message}`
          : 'An unexpected internal server error occurred.',
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
};
