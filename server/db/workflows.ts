import { getDb } from "../db";
import { workflows, workflowExecutions, workflowSteps, Workflow, WorkflowExecution, WorkflowStep, InsertWorkflow, InsertWorkflowExecution, InsertWorkflowStep } from "../../drizzle/schema";
import { eq, and, desc, asc } from "drizzle-orm";

/**
 * Workflow Database Helpers
 * Provides CRUD operations for workflows, executions, and steps
 */

const getDatabase = async () => {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
};

// ============= WORKFLOWS =============

/**
 * Create a new workflow
 */
export async function createWorkflow(data: InsertWorkflow): Promise<Workflow> {
  const db = await getDatabase();
  const [result] = await db.insert(workflows).values(data);
  const workflow = await getWorkflowById(result.insertId);
  if (!workflow) throw new Error("Failed to create workflow");
  return workflow;
}

/**
 * Get workflow by ID
 */
export async function getWorkflowById(id: number): Promise<Workflow | null> {
  const db = await getDatabase();
  const [result] = await db.select().from(workflows).where(eq(workflows.id, id));
  return result || null;
}

/**
 * Get all workflows for a workspace
 */
export async function getWorkflowsByWorkspace(workspaceId: number): Promise<Workflow[]> {
  const db = await getDatabase();
  return db
    .select()
    .from(workflows)
    .where(eq(workflows.workspaceId, workspaceId))
    .orderBy(desc(workflows.createdAt));
}

/**
 * Get workflow by name in workspace
 */
export async function getWorkflowByName(workspaceId: number, name: string): Promise<Workflow | null> {
  const db = await getDatabase();
  const [result] = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.workspaceId, workspaceId), eq(workflows.name, name)));
  return result || null;
}

/**
 * Update workflow
 */
export async function updateWorkflow(id: number, data: Partial<InsertWorkflow>): Promise<Workflow | null> {
  const db = await getDatabase();
  await db.update(workflows).set({ ...data, updatedAt: new Date() }).where(eq(workflows.id, id));
  return getWorkflowById(id);
}

/**
 * Delete workflow
 */
export async function deleteWorkflow(id: number): Promise<boolean> {
  const db = await getDatabase();
  await db.delete(workflows).where(eq(workflows.id, id));
  return true;
}

/**
 * Get workflow version history
 */
export async function getWorkflowVersions(workspaceId: number, workflowId: number): Promise<Workflow[]> {
  const db = await getDatabase();
  return db
    .select()
    .from(workflows)
    .where(and(eq(workflows.workspaceId, workspaceId), eq(workflows.id, workflowId)))
    .orderBy(desc(workflows.version));
}

// ============= WORKFLOW EXECUTIONS =============

/**
 * Create a new workflow execution
 */
export async function createWorkflowExecution(data: InsertWorkflowExecution): Promise<WorkflowExecution> {
  const db = await getDatabase();
  const [result] = await db.insert(workflowExecutions).values(data);
  const execution = await getWorkflowExecutionById(result.insertId);
  if (!execution) throw new Error("Failed to create workflow execution");
  return execution;
}

/**
 * Get workflow execution by ID
 */
export async function getWorkflowExecutionById(id: number): Promise<WorkflowExecution | null> {
  const db = await getDatabase();
  const [result] = await db.select().from(workflowExecutions).where(eq(workflowExecutions.id, id));
  return result || null;
}

/**
 * Get all executions for a workflow
 */
export async function getWorkflowExecutions(workflowId: number, limit: number = 50): Promise<WorkflowExecution[]> {
  const db = await getDatabase();
  return db
    .select()
    .from(workflowExecutions)
    .where(eq(workflowExecutions.workflowId, workflowId))
    .orderBy(desc(workflowExecutions.createdAt))
    .limit(limit);
}

/**
 * Get all executions for a workspace
 */
export async function getWorkspaceExecutions(workspaceId: number, limit: number = 100): Promise<WorkflowExecution[]> {
  const db = await getDatabase();
  return db
    .select()
    .from(workflowExecutions)
    .where(eq(workflowExecutions.workspaceId, workspaceId))
    .orderBy(desc(workflowExecutions.createdAt))
    .limit(limit);
}

/**
 * Update workflow execution status
 */
export async function updateWorkflowExecution(
  id: number,
  data: Partial<InsertWorkflowExecution>
): Promise<WorkflowExecution | null> {
  const db = await getDatabase();
  await db.update(workflowExecutions).set(data).where(eq(workflowExecutions.id, id));
  return getWorkflowExecutionById(id);
}

/**
 * Get execution statistics for a workflow
 */
export async function getExecutionStats(workflowId: number): Promise<{
  total: number;
  success: number;
  failed: number;
  pending: number;
  running: number;
}> {
  const executions = await getWorkflowExecutions(workflowId, 1000);
  return {
    total: executions.length,
    success: executions.filter((e) => e.status === "success").length,
    failed: executions.filter((e) => e.status === "failed").length,
    pending: executions.filter((e) => e.status === "pending").length,
    running: executions.filter((e) => e.status === "running").length,
  };
}

// ============= WORKFLOW STEPS =============

/**
 * Create a new workflow step
 */
export async function createWorkflowStep(data: InsertWorkflowStep): Promise<WorkflowStep> {
  const db = await getDatabase();
  const [result] = await db.insert(workflowSteps).values(data);
  const step = await getWorkflowStepById(result.insertId);
  if (!step) throw new Error("Failed to create workflow step");
  return step;
}

/**
 * Get workflow step by ID
 */
export async function getWorkflowStepById(id: number): Promise<WorkflowStep | null> {
  const db = await getDatabase();
  const [result] = await db.select().from(workflowSteps).where(eq(workflowSteps.id, id));
  return result || null;
}

/**
 * Get all steps for an execution
 */
export async function getExecutionSteps(executionId: number): Promise<WorkflowStep[]> {
  const db = await getDatabase();
  return db
    .select()
    .from(workflowSteps)
    .where(eq(workflowSteps.executionId, executionId))
    .orderBy(asc(workflowSteps.createdAt));
}

/**
 * Update workflow step
 */
export async function updateWorkflowStep(id: number, data: Partial<InsertWorkflowStep>): Promise<WorkflowStep | null> {
  const db = await getDatabase();
  await db.update(workflowSteps).set(data).where(eq(workflowSteps.id, id));
  return getWorkflowStepById(id);
}

/**
 * Get step execution time
 */
export async function getStepDuration(id: number): Promise<number | null> {
  const step = await getWorkflowStepById(id);
  if (!step || !step.startedAt || !step.completedAt) return null;
  return step.completedAt.getTime() - step.startedAt.getTime();
}
