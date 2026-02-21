import crypto from "crypto";
import { createWebhookEvent, updateWebhookEventStatus } from "../db/webhooks";
import { getWebhookById } from "../db/webhooks";

export interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: number;
  id: string;
}

/**
 * Generate HMAC signature for webhook
 */
export function generateWebhookSignature(
  payload: string,
  secret: string
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Send webhook with retry logic
 */
export async function sendWebhook(
  webhookId: number,
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  const webhook = await getWebhookById(webhookId);
  if (!webhook || !webhook.active) {
    return;
  }

  const payload: WebhookPayload = {
    event,
    data,
    timestamp: Date.now(),
    id: crypto.randomUUID(),
  };

  const payloadString = JSON.stringify(payload);
  const signature = generateWebhookSignature(payloadString, webhook.secret);

  // Create webhook event record
  const webhookEvent = await createWebhookEvent({
    webhookId,
    event,
    payload: payloadString,
    statusCode: null,
    response: null,
    attempt: 0,
    nextRetry: null,
  });

  // Attempt to send webhook
  await deliverWebhook(webhookEvent.id, webhook.url, payloadString, signature);
}

/**
 * Deliver webhook with retry logic
 */
async function deliverWebhook(
  eventId: number,
  url: string,
  payload: string,
  signature: string,
  attempt: number = 0
): Promise<void> {
  const maxAttempts = 5;
  const baseDelay = 1000; // 1 second

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-ID": String(eventId),
      },
      body: payload,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();

    // Update event with response
    const nextRetry =
      response.ok || attempt >= maxAttempts
        ? null
        : new Date(Date.now() + baseDelay * Math.pow(2, attempt));

    await updateWebhookEventStatus(
      eventId,
      response.status,
      responseText,
      attempt + 1,
      nextRetry
    );
  } catch (error) {
    // Schedule retry
    const nextAttempt = attempt + 1;
    const nextRetry =
      nextAttempt >= maxAttempts
        ? null
        : new Date(Date.now() + baseDelay * Math.pow(2, attempt));

    await updateWebhookEventStatus(
      eventId,
      null,
      error instanceof Error ? error.message : "Unknown error",
      nextAttempt,
      nextRetry
    );
  }
}

/**
 * Process pending webhooks (for background job)
 */
export async function processPendingWebhooks(): Promise<void> {
  // This would be called by a background job/cron
  // Implementation depends on your job queue system
  console.log("Processing pending webhooks...");
}
