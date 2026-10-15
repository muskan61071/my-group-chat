import type { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: Record<string, any>;
}

export function apiSuccess<T>(res: Response, data: T, message?: string, status: number = 200, meta?: Record<string, any>) {
  return res.status(status).json({
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  });
}

export function apiError(res: Response, error: string, status: number = 400, details?: any) {
  return res.status(status).json({
    success: false,
    error,
    ...(details && { details }),
  });
}
