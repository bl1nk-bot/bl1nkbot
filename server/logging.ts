import { getClickHouseClient } from "./clickhouse";

/**
 * Log entry structure for storing in S3
 */
export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  requestId?: string;
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
  private tableEnsured = false;

  constructor() {
    // Auto-flush logs periodically
    this.flushInterval = setInterval(() => {
      this.flush().catch((err) => console.error("[Logger] Failed to flush logs:", err));
    }, this.flushIntervalMs);
    // Best-effort init
    this.ensureTable().catch((err) =>
      console.error("[Logger] Failed to ensure ClickHouse table:", err)
    );
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

    const client = getClickHouseClient();
    if (!client) {
      return;
    }

    const logsToFlush = [...this.logs];
    this.logs = [];

    try {
      await this.ensureTable();
      const rows = logsToFlush.map((log) => ({
        timestamp: new Date(log.timestamp),
        level: log.level,
        message: log.message,
        requestId: log.requestId ?? null,
        userId: log.userId ?? null,
        apiKey: log.apiKey ?? null,
        endpoint: log.endpoint ?? null,
        method: log.method ?? null,
        statusCode: log.statusCode ?? null,
        duration: log.duration ?? null,
        metadata: log.metadata ? JSON.stringify(log.metadata) : null,
      }));

      await client.insert({
        table: "logs",
        values: rows,
        format: "JSONEachRow",
      });
    } catch (error) {
      console.error("[Logger] Failed to flush logs to ClickHouse:", error);
      // Re-add logs if flush fails
      this.logs = [...logsToFlush, ...this.logs];
    }
  }

  /**
   * Get logs from S3 by date range
   */
  async getLogs(startDate: Date, endDate: Date): Promise<LogEntry[]> {
    try {
      const client = getClickHouseClient();
      if (!client) return [];

      await this.ensureTable();
      const result = await client.query({
        query: `
          SELECT timestamp, level, message, requestId, userId, apiKey, endpoint, method, statusCode, duration, metadata
          FROM logs
          WHERE timestamp BETWEEN {start: DateTime} AND {end: DateTime}
          ORDER BY timestamp DESC
        `,
        query_params: {
          start: startDate,
          end: endDate,
        },
        format: "JSONEachRow",
      });

      const rows = await result.json();
      return rows.map((row: any) => ({
        timestamp: new Date(row.timestamp).toISOString(),
        level: row.level,
        message: row.message,
        requestId: row.requestId ?? undefined,
        userId: row.userId ?? undefined,
        apiKey: row.apiKey ?? undefined,
        endpoint: row.endpoint ?? undefined,
        method: row.method ?? undefined,
        statusCode: row.statusCode ?? undefined,
        duration: row.duration ?? undefined,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      }));
    } catch (error) {
      console.error("[Logger] Failed to get logs from ClickHouse:", error);
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

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    const client = getClickHouseClient();
    if (!client) return;
    await client.exec({
      query: `
        CREATE TABLE IF NOT EXISTS logs (
          timestamp DateTime,
          level LowCardinality(String),
          message String,
          requestId Nullable(String),
          userId Nullable(UInt32),
          apiKey Nullable(String),
          endpoint Nullable(String),
          method Nullable(String),
          statusCode Nullable(UInt16),
          duration Nullable(UInt32),
          metadata Nullable(String)
        )
        ENGINE = MergeTree()
        ORDER BY (timestamp, level)
      `,
    });
    this.tableEnsured = true;
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
