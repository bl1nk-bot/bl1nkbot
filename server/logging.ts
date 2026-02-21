import { storagePut, storageGet } from "./storage";

/**
 * Log entry structure for storing in S3
 */
export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  userId?: number;
  apiKey?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Request/Response log structure
 */
export interface RequestLog extends LogEntry {
  level: "info";
  requestId: string;
  requestBody?: unknown;
  responseBody?: unknown;
  headers?: Record<string, string>;
}

/**
 * Error log structure
 */
export interface ErrorLog extends LogEntry {
  level: "error";
  error: string;
  stack?: string;
}

/**
 * Logger class for managing application logs
 */
export class Logger {
  private logs: LogEntry[] = [];
  private readonly maxLogsBeforeFlush = 100;
  private readonly flushIntervalMs = 60000; // 1 minute
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Auto-flush logs periodically
    this.flushInterval = setInterval(() => {
      this.flush().catch((err) => console.error("[Logger] Failed to flush logs:", err));
    }, this.flushIntervalMs);
  }

  /**
   * Log an info message
   */
  info(message: string, metadata?: Record<string, unknown>) {
    this.addLog({
      timestamp: new Date().toISOString(),
      level: "info",
      message,
      metadata,
    });
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: Record<string, unknown>) {
    this.addLog({
      timestamp: new Date().toISOString(),
      level: "warn",
      message,
      metadata,
    });
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | unknown, metadata?: Record<string, unknown>) {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      metadata,
    };
    this.addLog(errorLog);
  }

  /**
   * Log a debug message
   */
  debug(message: string, metadata?: Record<string, unknown>) {
    this.addLog({
      timestamp: new Date().toISOString(),
      level: "debug",
      message,
      metadata,
    });
  }

  /**
   * Log API request
   */
  logRequest(
    requestId: string,
    method: string,
    endpoint: string,
    userId?: number,
    apiKey?: string,
    requestBody?: unknown,
    headers?: Record<string, string>
  ) {
    const log: RequestLog = {
      timestamp: new Date().toISOString(),
      level: "info",
      message: `${method} ${endpoint}`,
      requestId,
      method,
      endpoint,
      userId,
      apiKey,
      requestBody,
      headers,
    };
    this.addLog(log);
  }

  /**
   * Log API response
   */
  logResponse(
    requestId: string,
    statusCode: number,
    duration: number,
    responseBody?: unknown
  ) {
    const log: LogEntry = {
      timestamp: new Date().toISOString(),
      level: statusCode >= 400 ? "warn" : "info",
      message: `Response ${statusCode}`,
      statusCode,
      duration,
      metadata: { requestId, responseBody },
    };
    this.addLog(log);
  }

  /**
   * Add a log entry
   */
  private addLog(log: LogEntry) {
    this.logs.push(log);

    // Flush if we reach the max logs
    if (this.logs.length >= this.maxLogsBeforeFlush) {
      this.flush().catch((err) => console.error("[Logger] Failed to flush logs:", err));
    }
  }

  /**
   * Flush logs to S3
   */
  async flush(): Promise<void> {
    if (this.logs.length === 0) {
      return;
    }

    const logsToFlush = [...this.logs];
    this.logs = [];

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const logKey = `logs/${timestamp}-${Date.now()}.json`;
      const logContent = JSON.stringify(logsToFlush, null, 2);

      await storagePut(logKey, logContent, "application/json");
      console.log(`[Logger] Flushed ${logsToFlush.length} logs to S3: ${logKey}`);
    } catch (error) {
      console.error("[Logger] Failed to flush logs to S3:", error);
      // Re-add logs if flush fails
      this.logs = [...logsToFlush, ...this.logs];
    }
  }

  /**
   * Get logs from S3 by date range
   */
  async getLogs(startDate: Date, endDate: Date): Promise<LogEntry[]> {
    try {
      const startTimestamp = startDate.toISOString().replace(/[:.]/g, "-");
      const endTimestamp = endDate.toISOString().replace(/[:.]/g, "-");

      // Get presigned URL for logs folder
      const { url } = await storageGet(`logs/`);
      console.log(`[Logger] Logs available at: ${url}`);

      // In a real implementation, you would list objects in S3 and filter by date range
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.error("[Logger] Failed to get logs from S3:", error);
      throw error;
    }
  }

  /**
   * Cleanup: flush remaining logs before shutdown
   */
  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flush();
  }
}

// Global logger instance
export const logger = new Logger();

// Flush logs on process exit
if (typeof process !== "undefined" && process.on) {
  process.on("exit", () => {
    logger.shutdown().catch((err) => console.error("[Logger] Failed to shutdown:", err));
  });
}
