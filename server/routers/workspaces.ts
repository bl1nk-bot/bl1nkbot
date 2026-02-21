import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as workspaceDb from "../db/workspaces";
import { nanoid } from "nanoid";

export const workspacesRouter = router({
  /**
   * Create a new workspace
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if slug is already taken
        const existing = await workspaceDb.getWorkspaceBySlug(input.slug);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Workspace slug already exists",
          });
        }

        // Create workspace
        const workspace = await workspaceDb.createWorkspace({
          name: input.name,
          slug: input.slug,
          ownerId: ctx.user.id,
          plan: "free",
        });

        if (!workspace) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create workspace",
          });
        }

        // Add owner as member
        await workspaceDb.addWorkspaceMember({
          workspaceId: workspace.id,
          userId: ctx.user.id,
          role: "owner",
        });

        return workspace;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Workspace] Create failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create workspace",
        });
      }
    }),

  /**
   * Get workspace by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await workspaceDb.getWorkspaceById(input.id);

        if (!workspace) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Workspace not found",
          });
        }

        // Check if user is member
        const role = await workspaceDb.getMemberRole(workspace.id, ctx.user.id);
        if (!role) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this workspace",
          });
        }

        return workspace;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Workspace] Get failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get workspace",
        });
      }
    }),

  /**
   * Get workspace by slug
   */
  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const workspace = await workspaceDb.getWorkspaceBySlug(input.slug);

        if (!workspace) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Workspace not found",
          });
        }

        // Check if user is member
        const role = await workspaceDb.getMemberRole(workspace.id, ctx.user.id);
        if (!role) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this workspace",
          });
        }

        return workspace;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Workspace] Get by slug failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get workspace",
        });
      }
    }),

  /**
   * List all workspaces for current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const workspaces = await workspaceDb.getUserWorkspaces(ctx.user.id);
      return workspaces;
    } catch (error) {
      console.error("[Workspace] List failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list workspaces",
      });
    }
  }),

  /**
   * Update workspace
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        plan: z.enum(["free", "pro", "enterprise"]).optional(),
        settings: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await workspaceDb.getWorkspaceById(input.id);
        if (!workspace) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Workspace not found",
          });
        }

        // Check if user is owner
        const role = await workspaceDb.getMemberRole(workspace.id, ctx.user.id);
        if (role !== "owner" && role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to update this workspace",
          });
        }

        const updated = await workspaceDb.updateWorkspace(input.id, {
          name: input.name,
          plan: input.plan,
          settings: input.settings,
        });

        return updated;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Workspace] Update failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update workspace",
        });
      }
    }),

  /**
   * Delete workspace
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await workspaceDb.getWorkspaceById(input.id);
        if (!workspace) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Workspace not found",
          });
        }

        // Check if user is owner
        if (workspace.ownerId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only the owner can delete this workspace",
          });
        }

        const success = await workspaceDb.deleteWorkspace(input.id);
        return { success };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Workspace] Delete failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete workspace",
        });
      }
    }),

  /**
   * Get workspace members
   */
  getMembers: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // Check if user is member
        const role = await workspaceDb.getMemberRole(input.workspaceId, ctx.user.id);
        if (!role) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this workspace",
          });
        }

        const members = await workspaceDb.getWorkspaceMembers(input.workspaceId);
        return members;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Workspace] Get members failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get workspace members",
        });
      }
    }),

  /**
   * Update member role
   */
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        userId: z.number(),
        role: z.enum(["owner", "admin", "member", "viewer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin
        const userRole = await workspaceDb.getMemberRole(input.workspaceId, ctx.user.id);
        if (userRole !== "owner" && userRole !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to update members",
          });
        }

        const success = await workspaceDb.updateMemberRole(
          input.workspaceId,
          input.userId,
          input.role
        );

        return { success };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Workspace] Update member role failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update member role",
        });
      }
    }),

  /**
   * Remove member from workspace
   */
  removeMember: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        userId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin
        const userRole = await workspaceDb.getMemberRole(input.workspaceId, ctx.user.id);
        if (userRole !== "owner" && userRole !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to remove members",
          });
        }

        const success = await workspaceDb.removeWorkspaceMember(
          input.workspaceId,
          input.userId
        );

        return { success };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Workspace] Remove member failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove member",
        });
      }
    }),

  /**
   * Invite member to workspace
   */
  inviteMember: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        email: z.string().email(),
        role: z.enum(["owner", "admin", "member", "viewer"]).default("member"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin
        const userRole = await workspaceDb.getMemberRole(input.workspaceId, ctx.user.id);
        if (userRole !== "owner" && userRole !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to invite members",
          });
        }

        // Create invitation
        const token = nanoid(32);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        const invitation = await workspaceDb.createWorkspaceInvitation({
          workspaceId: input.workspaceId,
          email: input.email,
          role: input.role,
          token,
          expiresAt,
        });

        return invitation;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Workspace] Invite member failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to invite member",
        });
      }
    }),

  /**
   * Accept workspace invitation
   */
  acceptInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const invitation = await workspaceDb.getInvitationByToken(input.token);

        if (!invitation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invitation not found",
          });
        }

        // Check if invitation is expired
        if (new Date() > invitation.expiresAt) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Invitation has expired",
          });
        }

        // Add user as member
        await workspaceDb.addWorkspaceMember({
          workspaceId: invitation.workspaceId,
          userId: ctx.user.id,
          role: invitation.role,
        });

        // Delete invitation
        await workspaceDb.deleteInvitation(invitation.id);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Workspace] Accept invitation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to accept invitation",
        });
      }
    }),
});
