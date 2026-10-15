import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || (err instanceof AppError ? err.status : 500);
  const message = err.message || 'Internal server error';

  if (status >= 500) {
    logger.error(`Unhandled Error: ${message}`, 'ErrorHandler', err.stack);
  }

  res.status(status).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
