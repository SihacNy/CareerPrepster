import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const method = req.method;
  const path = req.originalUrl || req.url;

  // Log incoming request at DEBUG level
  logger.debug('HTTP:REQ', `Incoming ${method} ${path}`, {
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
  });

  // Capture response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    const message = `${method} ${path} → ${status} (${duration}ms)`;

    if (status >= 500) {
      logger.critical('HTTP:RES', message, undefined, { duration: `${duration}ms`, status });
    } else if (status >= 400) {
      logger.warn('HTTP:RES', message, { duration: `${duration}ms`, status });
    } else {
      logger.info('HTTP:RES', message, { duration: `${duration}ms`, status });
    }
  });

  next();
};
