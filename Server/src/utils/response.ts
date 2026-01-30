import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export class ResponseHelper {
  static success<T>(res: Response, message: string, data?: T, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, statusCode: number = 500, error?: string): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error: error || message,
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
  }

  static notFound(res: Response, resource: string): Response {
    return this.error(res, `${resource} not found`, 404);
  }

  static badRequest(res: Response, message: string): Response {
    return this.error(res, message, 400);
  }

  static created<T>(res: Response, message: string, data?: T): Response {
    return this.success(res, message, data, 201);
  }
}

export const logRequest = (method: string, endpoint: string, userId?: string) => {
  const timestamp = new Date().toISOString();
  console.log(`📥 [${timestamp}] ${method} ${endpoint} ${userId ? `(User: ${userId})` : ''}`);
};

export const logSuccess = (method: string, endpoint: string, message: string) => {
  const timestamp = new Date().toISOString();
  console.log(`✅ [${timestamp}] ${method} ${endpoint} - ${message}`);
};

export const logError = (method: string, endpoint: string, error: Error) => {
  const timestamp = new Date().toISOString();
  console.error(`❌ [${timestamp}] ${method} ${endpoint} - Error: ${error.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack);
  }
};