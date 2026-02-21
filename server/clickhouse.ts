import { createClient } from "@clickhouse/client";
import { ENV } from "./_core/env";

let client: ReturnType<typeof createClient> | null = null;

export function getClickHouseClient() {
  if (!ENV.clickhouseLogging || !ENV.clickhouseUrl) {
    return null;
  }

  if (!client) {
    client = createClient({
      url: ENV.clickhouseUrl,
      username: ENV.clickhouseUser,
      password: ENV.clickhousePassword,
      database: ENV.clickhouseDatabase,
      keep_alive: { enabled: true },
    });
  }

  return client;
}
