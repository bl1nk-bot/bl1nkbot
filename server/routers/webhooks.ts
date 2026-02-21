import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createWebhook,
  getWebhookById,
  listWebhooks,
  updateWebhook,
  deleteWebhook,
  getWebhookEvents,
} from "../db/webhooks";
import { getMemberRole } from "../db/workspaces";
import { TRPCError } from "@trpc/server";
import { sendWebhook } from "../services/webhookService";

export const webhooksRouter = router({
  /**
   * Create a new webhook
   */
  create: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        url: z.string().url(),
        events: z.array(z.string()),
        active: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const role = await getMemberRole(input.workspaceId, ctx.user.id);
      if (!role || !["admin", "owner"].includes(role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create webhooks",
        });
      }

      const secret = Math.random().toString(36).substring(2, 15);

      return await createWebhook(input.workspaceId, {
        url: input.url,
        events: JSON.stringify(input.events),
        secret,
      active: input.active ? 1 : 0,
      retryPolicy: JSON.stringify({
          maxAttempts: 5,
          backoffMultiplier: 2,
          initialDelay: 1000,
        }),
      });
    }),

  /**
   * Get webhook by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const webhook = await getWebhookById(input.id);
      if (!webhook) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Webhook not found",
        });
      }

      const role = await getMemberRole(webhook.workspaceId, ctx.user.id);
      if (!role) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this webhook",
        });
      }

      return webhook;
    }),

  /**
   * List webhooks for a workspace
   */
  list: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const role = await getMemberRole(input.workspaceId, ctx.user.id);
      if (!role) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this workspace",
        });
      }

      return await listWebhooks(input.workspaceId);
    }),

  /**
   * Update webhook
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        url: z.string().url().optional(),
        events: z.array(z.string()).optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const webhook = await getWebhookById(input.id);
      if (!webhook) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Webhook not found",
        });
      }

      const role = await getMemberRole(webhook.workspaceId, ctx.user.id);
      if (!role || !["admin", "owner"].includes(role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this webhook",
        });
      }

      return await updateWebhook(input.id, {
        url: input.url,
        events: input.events ? JSON.stringify(input.events) : undefined,
        active: input.active ? 1 : 0,
      });
    }),

  /**
   * Delete webhook
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const webhook = await getWebhookById(input.id);
      if (!webhook) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Webhook not found",
        });
      }

      const role = await getMemberRole(webhook.workspaceId, ctx.user.id);
      if (!role || !["admin", "owner"].includes(role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this webhook",
        });
      }

      const success = await deleteWebhook(input.id);
      return { success };
    }),

  /**
   * Get webhook events
   */
  getEvents: protectedProcedure
    .input(
      z.object({
        webhookId: z.number(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const webhook = await getWebhookById(input.webhookId);
      if (!webhook) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Webhook not found",
        });
      }

      const role = await getMemberRole(webhook.workspaceId, ctx.user.id);
      if (!role) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this webhook",
        });
      }

      return await getWebhookEvents(input.webhookId, input.limit);
    }),

  /**
   * Test webhook
   */
  test: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const webhook = await getWebhookById(input.id);
      if (!webhook) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Webhook not found",
        });
      }

      const role = await getMemberRole(webhook.workspaceId, ctx.user.id);
      if (!role || !["admin", "owner"].includes(role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to test this webhook",
        });
      }

      // Send test webhook
      await sendWebhook(input.id, "webhook.test", {
        message: "This is a test webhook",
        timestamp: new Date().toISOString(),
      });

      return { success: true, message: "Test webhook sent" };
    }),
});
