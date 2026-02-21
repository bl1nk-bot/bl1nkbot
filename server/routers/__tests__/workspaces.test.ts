import { describe, it, expect, beforeEach, vi } from "vitest";
import { workspacesRouter } from "../workspaces";
import * as workspaceDb from "../../db/workspaces";

// Mock the COOKIE_NAME import
vi.mock("@shared/const", () => ({
  COOKIE_NAME: "session",
}));

// Mock the database functions
vi.mock("../../db/workspaces");

describe("Workspaces Router", () => {
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

  const mockWorkspace = {
    id: 1,
    name: "Test Workspace",
    slug: "test-workspace",
    ownerId: 1,
    plan: "free" as const,
    settings: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new workspace", async () => {
      const caller = workspacesRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workspaceDb.getWorkspaceBySlug).mockResolvedValue(null);
      vi.mocked(workspaceDb.createWorkspace).mockResolvedValue(mockWorkspace);
      vi.mocked(workspaceDb.addWorkspaceMember).mockResolvedValue({
        id: 1,
        workspaceId: 1,
        userId: 1,
        role: "owner" as const,
        permissions: null,
        invitedAt: null,
        joinedAt: new Date(),
      });

      const result = await caller.create({
        name: "Test Workspace",
        slug: "test-workspace",
      });

      expect(result).toEqual(mockWorkspace);
      expect(workspaceDb.createWorkspace).toHaveBeenCalled();
    });

    it("should reject duplicate slug", async () => {
      const caller = workspacesRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workspaceDb.getWorkspaceBySlug).mockResolvedValue(mockWorkspace);

      await expect(
        caller.create({
          name: "Test Workspace",
          slug: "test-workspace",
        })
      ).rejects.toThrow("Workspace slug already exists");
    });

    it("should reject invalid slug format", async () => {
      const caller = workspacesRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.create({
          name: "Test Workspace",
          slug: "Test Workspace", // Invalid: contains spaces and uppercase
        })
      ).rejects.toThrow();
    });
  });

  describe("getById", () => {
    it("should get workspace by id", async () => {
      const caller = workspacesRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workspaceDb.getWorkspaceById).mockResolvedValue(mockWorkspace);
      vi.mocked(workspaceDb.getMemberRole).mockResolvedValue("owner");

      const result = await caller.getById({ id: 1 });

      expect(result).toEqual(mockWorkspace);
    });

    it("should reject if user is not a member", async () => {
      const caller = workspacesRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workspaceDb.getWorkspaceById).mockResolvedValue(mockWorkspace);
      vi.mocked(workspaceDb.getMemberRole).mockResolvedValue(null);

      await expect(caller.getById({ id: 1 })).rejects.toThrow(
        "You don't have access to this workspace"
      );
    });
  });

  describe("list", () => {
    it("should list all workspaces for user", async () => {
      const caller = workspacesRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workspaceDb.getUserWorkspaces).mockResolvedValue([mockWorkspace]);

      const result = await caller.list();

      expect(result).toEqual([mockWorkspace]);
      expect(workspaceDb.getUserWorkspaces).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe("update", () => {
    it("should update workspace if user is admin", async () => {
      const caller = workspacesRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const updatedWorkspace = {
        ...mockWorkspace,
        name: "Updated Workspace",
      };

      vi.mocked(workspaceDb.getWorkspaceById).mockResolvedValue(mockWorkspace);
      vi.mocked(workspaceDb.getMemberRole).mockResolvedValue("admin");
      vi.mocked(workspaceDb.updateWorkspace).mockResolvedValue(updatedWorkspace);

      const result = await caller.update({
        id: 1,
        name: "Updated Workspace",
      });

      expect(result).toEqual(updatedWorkspace);
    });

    it("should reject if user is not admin", async () => {
      const caller = workspacesRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workspaceDb.getWorkspaceById).mockResolvedValue(mockWorkspace);
      vi.mocked(workspaceDb.getMemberRole).mockResolvedValue("member");

      await expect(
        caller.update({
          id: 1,
          name: "Updated Workspace",
        })
      ).rejects.toThrow("You don't have permission to update this workspace");
    });
  });

  describe("delete", () => {
    it("should delete workspace if user is owner", async () => {
      const caller = workspacesRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workspaceDb.getWorkspaceById).mockResolvedValue(mockWorkspace);
      vi.mocked(workspaceDb.deleteWorkspace).mockResolvedValue(true);

      const result = await caller.delete({ id: 1 });

      expect(result).toEqual({ success: true });
    });

    it("should reject if user is not owner", async () => {
      const caller = workspacesRouter.createCaller({
        user: { ...mockUser, id: 2 },
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workspaceDb.getWorkspaceById).mockResolvedValue(mockWorkspace);

      await expect(caller.delete({ id: 1 })).rejects.toThrow(
        "Only the owner can delete this workspace"
      );
    });
  });

  describe("inviteMember", () => {
    it("should invite member if user is admin", async () => {
      const caller = workspacesRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const mockInvitation = {
        id: 1,
        workspaceId: 1,
        email: "newuser@example.com",
        role: "member" as const,
        token: "test-token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      vi.mocked(workspaceDb.getMemberRole).mockResolvedValue("admin");
      vi.mocked(workspaceDb.createWorkspaceInvitation).mockResolvedValue(
        mockInvitation
      );

      const result = await caller.inviteMember({
        workspaceId: 1,
        email: "newuser@example.com",
        role: "member",
      });

      expect(result).toEqual(mockInvitation);
    });

    it("should reject if user is not admin", async () => {
      const caller = workspacesRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      vi.mocked(workspaceDb.getMemberRole).mockResolvedValue("member");

      await expect(
        caller.inviteMember({
          workspaceId: 1,
          email: "newuser@example.com",
          role: "member",
        })
      ).rejects.toThrow("You don't have permission to invite members");
    });
  });

  describe("acceptInvitation", () => {
    it("should accept valid invitation", async () => {
      const caller = workspacesRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const mockInvitation = {
        id: 1,
        workspaceId: 1,
        email: "test@example.com",
        role: "member" as const,
        token: "test-token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      vi.mocked(workspaceDb.getInvitationByToken).mockResolvedValue(
        mockInvitation
      );
      vi.mocked(workspaceDb.addWorkspaceMember).mockResolvedValue({
        id: 1,
        workspaceId: 1,
        userId: 1,
        role: "member" as const,
        permissions: null,
        invitedAt: null,
        joinedAt: new Date(),
      });
      vi.mocked(workspaceDb.deleteInvitation).mockResolvedValue(true);

      const result = await caller.acceptInvitation({ token: "test-token" });

      expect(result).toEqual({ success: true });
    });

    it("should reject expired invitation", async () => {
      const caller = workspacesRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const mockInvitation = {
        id: 1,
        workspaceId: 1,
        email: "test@example.com",
        role: "member" as const,
        token: "test-token",
        expiresAt: new Date(Date.now() - 1000), // Expired
        createdAt: new Date(),
      };

      vi.mocked(workspaceDb.getInvitationByToken).mockResolvedValue(
        mockInvitation
      );

      await expect(
        caller.acceptInvitation({ token: "test-token" })
      ).rejects.toThrow("Invitation has expired");
    });
  });
});
