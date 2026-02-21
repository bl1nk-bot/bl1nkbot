import { describe, it, expect, beforeEach, vi } from "vitest";
import { workflowRouter } from "../workflows";
import * as workflowDb from "../../db/workflows";

// Mock the COOKIE_NAME import
vi.mock("@shared/const", () => ({
  COOKIE_NAME: "session",
}));

// Mock the database functions
vi.mock("../../db/workflows");

describe("Workflow Router", () => {
  const mockUser = {
    id: 1,
    openId: "test-user",
    name: "Test User",
    email: "test@example.com",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const mockWorkflow = {
    id: 1,
    workspaceId: 1,
    name: "Test Workflow",
    description: "A test workflow",
    definition: JSON.stringify({ steps: [] }),
    status: "draft" as const,
    version: 1,
    createdBy: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockExecution = {
    id: 1,
    workspaceId: 1,
    workflowId: 1,
    triggeredBy: "manual",
    status: "pending" as const,
    input: null,
    result: null,
    error: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new workflow", async () => {
      const caller = workflowRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workflowDb.createWorkflow).mockResolvedValue(mockWorkflow);

      const result = await caller.create({
        workspaceId: 1,
        name: "Test Workflow",
        description: "A test workflow",
        definition: JSON.stringify({ steps: [] }),
      });

      expect(result).toEqual(mockWorkflow);
      expect(workflowDb.createWorkflow).toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should get workflow by ID", async () => {
      const caller = workflowRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workflowDb.getWorkflowById).mockResolvedValue(mockWorkflow);

      const result = await caller.getById({ id: 1 });

      expect(result).toEqual(mockWorkflow);
      expect(workflowDb.getWorkflowById).toHaveBeenCalledWith(1);
    });

    it("should throw NOT_FOUND error for non-existent workflow", async () => {
      const caller = workflowRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workflowDb.getWorkflowById).mockResolvedValue(null);

      await expect(caller.getById({ id: 99999 })).rejects.toThrow();
    });
  });

  describe("listByWorkspace", () => {
    it("should list workflows by workspace", async () => {
      const caller = workflowRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workflowDb.getWorkflowsByWorkspace).mockResolvedValue([mockWorkflow]);

      const result = await caller.listByWorkspace({ workspaceId: 1 });

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual(mockWorkflow);
    });
  });

  describe("getByName", () => {
    it("should get workflow by name", async () => {
      const caller = workflowRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workflowDb.getWorkflowByName).mockResolvedValue(mockWorkflow);

      const result = await caller.getByName({
        workspaceId: 1,
        name: "Test Workflow",
      });

      expect(result).toEqual(mockWorkflow);
    });
  });

  describe("update", () => {
    it("should update workflow", async () => {
      const caller = workflowRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const updatedWorkflow = { ...mockWorkflow, status: "published" as const };
      vi.mocked(workflowDb.updateWorkflow).mockResolvedValue(updatedWorkflow);

      const result = await caller.update({
        id: 1,
        status: "published",
      });

      expect(result.status).toBe("published");
    });
  });

  describe("delete", () => {
    it("should delete workflow", async () => {
      const caller = workflowRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workflowDb.deleteWorkflow).mockResolvedValue(true);

      const result = await caller.delete({ id: 1 });

      expect(result.success).toBe(true);
    });
  });

  describe("execute", () => {
    it("should execute workflow", async () => {
      const caller = workflowRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workflowDb.getWorkflowById).mockResolvedValue(mockWorkflow);
      vi.mocked(workflowDb.createWorkflowExecution).mockResolvedValue(mockExecution);

      const result = await caller.execute({
        workflowId: 1,
        input: JSON.stringify({ test: "data" }),
      });

      expect(result.status).toBe("pending");
      expect(result.workflowId).toBe(1);
    });
  });

  describe("getExecution", () => {
    it("should get workflow execution by ID", async () => {
      const caller = workflowRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workflowDb.getWorkflowExecutionById).mockResolvedValue(mockExecution);

      const result = await caller.getExecution({ id: 1 });

      expect(result).toEqual(mockExecution);
    });
  });

  describe("listExecutions", () => {
    it("should list workflow executions", async () => {
      const caller = workflowRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workflowDb.getWorkflowExecutions).mockResolvedValue([mockExecution]);

      const result = await caller.listExecutions({ workflowId: 1 });

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual(mockExecution);
    });
  });

  describe("getStats", () => {
    it("should get execution statistics", async () => {
      const caller = workflowRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workflowDb.getExecutionStats).mockResolvedValue({
        total: 10,
        success: 8,
        failed: 1,
        pending: 1,
        running: 0,
      });

      const result = await caller.getStats({ workflowId: 1 });

      expect(result.total).toBe(10);
      expect(result.success).toBe(8);
    });
  });

  describe("getSteps", () => {
    it("should get execution steps", async () => {
      const caller = workflowRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const mockStep = {
        id: 1,
        executionId: 1,
        stepId: "step-1",
        status: "success" as const,
        input: null,
        output: null,
        duration: 100,
        error: null,
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: new Date(),
      };

      vi.mocked(workflowDb.getExecutionSteps).mockResolvedValue([mockStep]);

      const result = await caller.getSteps({ executionId: 1 });

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual(mockStep);
    });
  });

  describe("updateStep", () => {
    it("should update workflow step", async () => {
      const caller = workflowRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const mockStep = {
        id: 1,
        executionId: 1,
        stepId: "step-1",
        status: "success" as const,
        input: null,
        output: JSON.stringify({ result: "success" }),
        duration: 100,
        error: null,
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: new Date(),
      };

      vi.mocked(workflowDb.updateWorkflowStep).mockResolvedValue(mockStep);

      const result = await caller.updateStep({
        stepId: 1,
        status: "success",
        output: JSON.stringify({ result: "success" }),
      });

      expect(result.status).toBe("success");
    });
  });
});
