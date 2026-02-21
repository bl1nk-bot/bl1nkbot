import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  workspaces,
  workspaceMembers,
  workspaceInvitations,
  InsertWorkspace,
  Workspace,
  WorkspaceMember,
  InsertWorkspaceMember,
  WorkspaceInvitation,
  InsertWorkspaceInvitation,
} from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Create a new workspace
 */
export async function createWorkspace(data: InsertWorkspace): Promise<Workspace | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(workspaces).values(data);
    // Get the created workspace
    const result = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, data.slug))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create workspace:", error);
    throw error;
  }
}

/**
 * Get workspace by ID
 */
export async function getWorkspaceById(id: number): Promise<Workspace | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get workspace:", error);
    throw error;
  }
}

/**
 * Get workspace by slug
 */
export async function getWorkspaceBySlug(slug: string): Promise<Workspace | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, slug))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get workspace by slug:", error);
    throw error;
  }
}

/**
 * Get all workspaces for a user
 */
export async function getUserWorkspaces(userId: number): Promise<Workspace[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({
        workspace: workspaces,
      })
      .from(workspaces)
      .innerJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(eq(workspaceMembers.userId, userId));

    return result.map((r) => r.workspace);
  } catch (error) {
    console.error("[Database] Failed to get user workspaces:", error);
    throw error;
  }
}

/**
 * Update workspace
 */
export async function updateWorkspace(
  id: number,
  data: Partial<InsertWorkspace>
): Promise<Workspace | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(workspaces).set(data).where(eq(workspaces.id, id));
    return getWorkspaceById(id);
  } catch (error) {
    console.error("[Database] Failed to update workspace:", error);
    throw error;
  }
}

/**
 * Delete workspace
 */
export async function deleteWorkspace(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(workspaces).where(eq(workspaces.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete workspace:", error);
    throw error;
  }
}

/**
 * Add member to workspace
 */
export async function addWorkspaceMember(
  data: InsertWorkspaceMember
): Promise<WorkspaceMember | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(workspaceMembers).values(data);
    // Get the created member
    const result = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, data.workspaceId),
          eq(workspaceMembers.userId, data.userId)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to add workspace member:", error);
    throw error;
  }
}

/**
 * Get workspace members
 */
export async function getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get workspace members:", error);
    throw error;
  }
}

/**
 * Get member role in workspace
 */
export async function getMemberRole(
  workspaceId: number,
  userId: number
): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0].role : null;
  } catch (error) {
    console.error("[Database] Failed to get member role:", error);
    throw error;
  }
}

/**
 * Update member role
 */
export async function updateMemberRole(
  workspaceId: number,
  userId: number,
  role: "owner" | "admin" | "member" | "viewer"
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(workspaceMembers)
      .set({ role })
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      );

    return true;
  } catch (error) {
    console.error("[Database] Failed to update member role:", error);
    throw error;
  }
}

/**
 * Remove member from workspace
 */
export async function removeWorkspaceMember(
  workspaceId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      );

    return true;
  } catch (error) {
    console.error("[Database] Failed to remove workspace member:", error);
    throw error;
  }
}

/**
 * Create workspace invitation
 */
export async function createWorkspaceInvitation(
  data: InsertWorkspaceInvitation
): Promise<WorkspaceInvitation | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(workspaceInvitations).values(data);
    // Get the created invitation
    const result = await db
      .select()
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.token, data.token))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create workspace invitation:", error);
    throw error;
  }
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(token: string): Promise<WorkspaceInvitation | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.token, token))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get invitation by token:", error);
    throw error;
  }
}

/**
 * Get workspace invitations
 */
export async function getWorkspaceInvitations(workspaceId: number): Promise<WorkspaceInvitation[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.workspaceId, workspaceId));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get workspace invitations:", error);
    throw error;
  }
}

/**
 * Delete invitation
 */
export async function deleteInvitation(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(workspaceInvitations).where(eq(workspaceInvitations.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete invitation:", error);
    throw error;
  }
}
