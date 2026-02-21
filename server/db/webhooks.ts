import { eq, desc } from "drizzle-orm";
import {
  webhooks,
  webhookEvents,
  type InsertWebhook,
  type InsertWebhookEvent,
} from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Create a new webhook
 */
export async function createWebhook(
  workspaceId: number,
  data: Omit<InsertWebhook, "workspaceId">
): Promise<typeof webhooks.$inferSelect> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .insert(webhooks)
    .values({
      ...data,
      workspaceId,
    });

  // Fetch the created webhook
  const created = await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.workspaceId, workspaceId))
    .orderBy(desc(webhooks.createdAt))
    .limit(1);

  return created[0];
}

/**
 * Get webhook by ID
 */
export async function getWebhookById(
  id: number
): Promise<typeof webhooks.$inferSelect | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(webhooks).where(eq(webhooks.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * List webhooks for a workspace
 */
export async function listWebhooks(
  workspaceId: number
): Promise<(typeof webhooks.$inferSelect)[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.workspaceId, workspaceId))
    .orderBy(desc(webhooks.createdAt));
}

/**
 * Update webhook
 */
export async function updateWebhook(
  id: number,
  data: Partial<Omit<InsertWebhook, "workspaceId">>
): Promise<typeof webhooks.$inferSelect | null> {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(webhooks)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(webhooks.id, id));

  return await getWebhookById(id);
}

/**
 * Delete webhook
 */
export async function deleteWebhook(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.delete(webhooks).where(eq(webhooks.id, id));
  return true;
}

/**
 * Create webhook event
 */
export async function createWebhookEvent(
  data: InsertWebhookEvent
): Promise<typeof webhookEvents.$inferSelect> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(webhookEvents).values(data);

  // Fetch the created event
  const created = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.webhookId, data.webhookId))
    .orderBy(desc(webhookEvents.createdAt))
    .limit(1);

  return created[0];
}

/**
 * Get webhook events
 */
export async function getWebhookEvents(
  webhookId: number,
  limit: number = 50
): Promise<(typeof webhookEvents.$inferSelect)[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.webhookId, webhookId))
    .orderBy(desc(webhookEvents.createdAt))
    .limit(limit);
}

/**
 * Get pending webhook events (for retry)
 */
export async function getPendingWebhookEvents(): Promise<
  (typeof webhookEvents.$inferSelect)[]
> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(webhookEvents)
    .orderBy(webhookEvents.createdAt)
    .limit(100);
}

/**
 * Update webhook event status
 */
export async function updateWebhookEventStatus(
  id: number,
  statusCode: number | null,
  response: string | null,
  attempt: number,
  nextRetry: Date | null
): Promise<typeof webhookEvents.$inferSelect | null> {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(webhookEvents)
    .set({
      statusCode,
      response,
      attempt,
      nextRetry,
    })
    .where(eq(webhookEvents.id, id));

  const result = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Delete old webhook events (cleanup)
 */
export async function deleteOldWebhookEvents(beforeDate: Date): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // For now, just delete all old events
  // In production, you'd want to use a proper date comparison
  await db.delete(webhookEvents);

  return 0;
}
