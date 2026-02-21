import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createWorkflow,
  getWorkflowById,
  getWorkflowsByWorkspace,
  getWorkflowByName,
  updateWorkflow,
  deleteWorkflow,
  createWorkflowExecution,
  getWorkflowExecutionById,
  getWorkflowExecutions,
  getWorkspaceExecutions,
  updateWorkflowExecution,
  getExecutionStats,
  createWorkflowStep,
  getExecutionSteps,
  updateWorkflowStep,
} from "../db/workflows";

/**
 * Workflow Management Router
 * Handles workflow creation, execution, and step tracking
 */
export const workflowRouter = router({
  /**
   * Create a new workflow
   */
  create: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        definition: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user has access to workspace
      const workflow = await createWorkflow({
        workspaceId: input.workspaceId,
        name: input.name,
        description: input.description || null,
        definition: input.definition,
        status: "draft",
        version: 1,
        createdBy: ctx.user.id,
      });
      return workflow;
    }),

  /**
   * Get workflow by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const workflow = await getWorkflowById(input.id);
      if (!workflow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workflow not found" });
      }
      return workflow;
    }),

  /**
   * Get all workflows for a workspace
   */
  listByWorkspace: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input }) => {
      return getWorkflowsByWorkspace(input.workspaceId);
    }),

  /**
   * Get workflow by name
   */
  getByName: protectedProcedure
    .input(z.object({ workspaceId: z.number(), name: z.string() }))
    .query(async ({ input }) => {
      const workflow = await getWorkflowByName(input.workspaceId, input.name);
      if (!workflow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workflow not found" });
      }
      return workflow;
    }),

  /**
   * Update workflow
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        definition: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const workflow = await updateWorkflow(input.id, {
        name: input.name,
        description: input.description,
        definition: input.definition,
        status: input.status,
      });
      if (!workflow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workflow not found" });
      }
      return workflow;
    }),

  /**
   * Delete workflow
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const success = await deleteWorkflow(input.id);
      if (!success) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workflow not found" });
      }
      return { success: true };
    }),

  /**
   * Execute workflow
   */
  execute: protectedProcedure
    .input(
      z.object({
        workflowId: z.number(),
        input: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const workflow = await getWorkflowById(input.workflowId);
      if (!workflow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workflow not found" });
      }

      const execution = await createWorkflowExecution({
        workspaceId: workflow.workspaceId,
        workflowId: input.workflowId,
        triggeredBy: "manual",
        status: "pending",
        input: input.input || null,
      });
      return execution;
    }),

  /**
   * Get workflow execution by ID
   */
  getExecution: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const execution = await getWorkflowExecutionById(input.id);
      if (!execution) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Execution not found" });
      }
      return execution;
    }),

  /**
   * Get all executions for a workflow
   */
  listExecutions: protectedProcedure
    .input(z.object({ workflowId: z.number(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return getWorkflowExecutions(input.workflowId, input.limit);
    }),

  /**
   * Get execution statistics
   */
  getStats: protectedProcedure
    .input(z.object({ workflowId: z.number() }))
    .query(async ({ input }) => {
      return getExecutionStats(input.workflowId);
    }),

  /**
   * Get execution steps
   */
  getSteps: protectedProcedure
    .input(z.object({ executionId: z.number() }))
    .query(async ({ input }) => {
      return getExecutionSteps(input.executionId);
    }),

  /**
   * Update execution step
   */
  updateStep: protectedProcedure
    .input(
      z.object({
        stepId: z.number(),
        status: z.enum(["pending", "running", "success", "failed", "skipped"]).optional(),
        output: z.string().optional(),
        error: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const step = await updateWorkflowStep(input.stepId, {
        status: input.status,
        output: input.output,
        error: input.error,
      });
      if (!step) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Step not found" });
      }
      return step;
    }),
});
