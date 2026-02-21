import { Express } from 'express';
import { loggingMiddleware, errorLoggingMiddleware } from '../middleware/logging';
import { logger } from '../logging';

/**
 * Setup logging middleware for Express server
 */
export function setupLogging(app: Express): void {
  // Apply logging middleware to all routes
  app.use(loggingMiddleware);

  // Apply error logging middleware
  app.use(errorLoggingMiddleware);

  // Log server startup
  logger.info('Logging middleware initialized', {
    timestamp: new Date().toISOString(),
  });

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    await logger.shutdown();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    await logger.shutdown();
    process.exit(0);
  });
}
