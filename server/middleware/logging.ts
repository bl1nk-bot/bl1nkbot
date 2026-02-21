import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../logging";

/**
 * Middleware for logging API requests and responses
 */
export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = uuidv4();
  const startTime = Date.now();

  // Store request ID in response for logging
  res.locals.requestId = requestId;

  // Log incoming request
  const userId = (req as any).user?.id;
  const apiKey = req.headers["x-api-key"] as string | undefined;

  const headers: Record<string, string> = {};
  Object.entries(req.headers).forEach(([key, value]) => {
    if (!["authorization", "x-api-key"].includes(key) && typeof value === "string") {
      headers[key] = value;
    }
  });

  logger.logRequest(
    requestId,
    req.method,
    req.path,
    userId,
    apiKey,
    req.body,
    headers
  );

  // Intercept response
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    logger.logResponse(requestId, res.statusCode, duration, data);
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Middleware for API key validation and logging
 */
export async function apiKeyValidationMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (!apiKey) {
    logger.warn("API request without API key", {
      endpoint: req.path,
      method: req.method,
      ip: req.ip,
    });
    return res.status(401).json({ error: "API key is required" });
  }

  // Validate API key (this would typically check against database)
  // For now, just pass it through
  (req as any).apiKey = apiKey;

  next();
}

/**
 * Error logging middleware
 */
export function errorLoggingMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = res.locals.requestId || uuidv4();
  const duration = Date.now() - (res.locals.startTime || Date.now());

  logger.error(
    `Error in ${req.method} ${req.path}`,
    err,
    {
      requestId,
      endpoint: req.path,
      method: req.method,
      duration,
      statusCode: res.statusCode,
    }
  );

  res.status(500).json({
    error: "Internal server error",
    requestId,
  });
}
