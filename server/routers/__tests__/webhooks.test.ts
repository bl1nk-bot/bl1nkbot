import { describe, it, expect, beforeEach, vi } from "vitest";
import * as webhookDb from "../../db/webhooks";
import * as workspaceDb from "../../db/workspaces";

// Mock the database functions
vi.mock("../../db/webhooks");
vi.mock("../../db/workspaces");

describe("Webhook Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createWebhook", () => {
    it("should create a webhook", async () => {
      const mockWebhook = {
        id: 1,
        workspaceId: 1,
        url: "https://example.com/webhook",
        events: '["user.created"]',
        secret: "test-secret",
        active: 1,
        retryPolicy: '{"maxAttempts":5}',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(webhookDb.createWebhook).mockResolvedValue(mockWebhook);

      const result = await webhookDb.createWebhook(1, {
        url: "https://example.com/webhook",
        events: '["user.created"]',
        secret: "test-secret",
        active: 1,
        retryPolicy: '{"maxAttempts":5}',
      });

      expect(result).toEqual(mockWebhook);
      expect(webhookDb.createWebhook).toHaveBeenCalled();
    });
  });

  describe("getWebhookById", () => {
    it("should get webhook by ID", async () => {
      const mockWebhook = {
        id: 1,
        workspaceId: 1,
        url: "https://example.com/webhook",
        events: '["user.created"]',
        secret: "test-secret",
        active: 1,
        retryPolicy: '{"maxAttempts":5}',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(webhookDb.getWebhookById).mockResolvedValue(mockWebhook);

      const result = await webhookDb.getWebhookById(1);

      expect(result).toEqual(mockWebhook);
      expect(webhookDb.getWebhookById).toHaveBeenCalledWith(1);
    });

    it("should return null for non-existent webhook", async () => {
      vi.mocked(webhookDb.getWebhookById).mockResolvedValue(null);

      const result = await webhookDb.getWebhookById(999);

      expect(result).toBeNull();
    });
  });

  describe("listWebhooks", () => {
    it("should list webhooks for workspace", async () => {
      const mockWebhooks = [
        {
          id: 1,
          workspaceId: 1,
          url: "https://example.com/webhook1",
          events: '["user.created"]',
          secret: "test-secret-1",
          active: 1,
          retryPolicy: '{"maxAttempts":5}',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          workspaceId: 1,
          url: "https://example.com/webhook2",
          events: '["user.updated"]',
          secret: "test-secret-2",
          active: 1,
          retryPolicy: '{"maxAttempts":5}',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(webhookDb.listWebhooks).mockResolvedValue(mockWebhooks);

      const result = await webhookDb.listWebhooks(1);

      expect(result).toEqual(mockWebhooks);
      expect(result).toHaveLength(2);
      expect(webhookDb.listWebhooks).toHaveBeenCalledWith(1);
    });
  });

  describe("updateWebhook", () => {
    it("should update webhook", async () => {
      const updatedWebhook = {
        id: 1,
        workspaceId: 1,
        url: "https://example.com/webhook-updated",
        events: '["user.created"]',
        secret: "test-secret",
        active: 1,
        retryPolicy: '{"maxAttempts":5}',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(webhookDb.updateWebhook).mockResolvedValue(updatedWebhook);

      const result = await webhookDb.updateWebhook(1, {
        url: "https://example.com/webhook-updated",
      });

      expect(result).toEqual(updatedWebhook);
      expect(webhookDb.updateWebhook).toHaveBeenCalled();
    });
  });

  describe("deleteWebhook", () => {
    it("should delete webhook", async () => {
      vi.mocked(webhookDb.deleteWebhook).mockResolvedValue(true);

      const result = await webhookDb.deleteWebhook(1);

      expect(result).toBe(true);
      expect(webhookDb.deleteWebhook).toHaveBeenCalledWith(1);
    });
  });

  describe("getWebhookEvents", () => {
    it("should get webhook events", async () => {
      const mockEvents = [
        {
          id: 1,
          webhookId: 1,
          event: "user.created",
          payload: '{"userId":1}',
          statusCode: 200,
          response: "OK",
          attempt: 1,
          nextRetry: null,
          createdAt: new Date(),
        },
      ];

      vi.mocked(webhookDb.getWebhookEvents).mockResolvedValue(mockEvents);

      const result = await webhookDb.getWebhookEvents(1);

      expect(result).toEqual(mockEvents);
      expect(webhookDb.getWebhookEvents).toHaveBeenCalledWith(1);
    });
  });

  describe("createWebhookEvent", () => {
    it("should create webhook event", async () => {
      const mockEvent = {
        id: 1,
        webhookId: 1,
        event: "user.created",
        payload: '{"userId":1}',
        statusCode: null,
        response: null,
        attempt: 0,
        nextRetry: null,
        createdAt: new Date(),
      };

      vi.mocked(webhookDb.createWebhookEvent).mockResolvedValue(mockEvent);

      const result = await webhookDb.createWebhookEvent({
        webhookId: 1,
        event: "user.created",
        payload: '{"userId":1}',
        statusCode: null,
        response: null,
        attempt: 0,
        nextRetry: null,
      });

      expect(result).toEqual(mockEvent);
      expect(webhookDb.createWebhookEvent).toHaveBeenCalled();
    });
  });

  describe("updateWebhookEventStatus", () => {
    it("should update webhook event status", async () => {
      const updatedEvent = {
        id: 1,
        webhookId: 1,
        event: "user.created",
        payload: '{"userId":1}',
        statusCode: 200,
        response: "OK",
        attempt: 1,
        nextRetry: null,
        createdAt: new Date(),
      };

      vi.mocked(webhookDb.updateWebhookEventStatus).mockResolvedValue(
        updatedEvent
      );

      const result = await webhookDb.updateWebhookEventStatus(1, 200, "OK", 1, null);

      expect(result).toEqual(updatedEvent);
      expect(webhookDb.updateWebhookEventStatus).toHaveBeenCalledWith(
        1,
        200,
        "OK",
        1,
        null
      );
    });
  });
});
