import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  createUserAccount,
  getUserAccountByEmail,
  getUserAccountByApiKey,
  updateUserAccount,
  getUserAccountById,
} from "../db";
import { z } from "zod";

/**
 * User account router for managing user credentials and API keys
 */
export const userAccountsRouter = router({
  /**
   * Register a new user account
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        provider: z.string().default("email"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if user already exists
        const existing = await getUserAccountByEmail(input.email);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User with this email already exists",
          });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 10);

        // Generate API keys
        const apiKey = `sk_${uuidv4()}`;
        const testApiKey = `test_sk_${uuidv4()}`;

        // Create user account
        const account = await createUserAccount({
          userId: 0, // Will be updated with actual user ID
          email: input.email,
          passwordHash,
          apiKey,
          testApiKey,
          provider: input.provider,
          version: 1,
          tier: "free",
        });

        if (!account) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user account",
          });
        }

        return {
          id: account.id,
          email: account.email,
          apiKey: account.apiKey,
          testApiKey: account.testApiKey,
          tier: account.tier,
          createdAt: account.createdAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to register user",
          cause: error,
        });
      }
    }),

  /**
   * Login with email and password
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const account = await getUserAccountByEmail(input.email);
        if (!account) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        // Verify password
        const isValid = await bcrypt.compare(input.password, account.passwordHash);
        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        return {
          id: account.id,
          email: account.email,
          apiKey: account.apiKey,
          tier: account.tier,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Login failed",
          cause: error,
        });
      }
    }),

  /**
   * Get current user account details
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    try {
      // In a real app, you would fetch the account from the database
      // using the authenticated user's ID
      return {
        id: ctx.user.id,
        email: ctx.user.email,
        role: ctx.user.role,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user account",
        cause: error,
      });
    }
  }),

  /**
   * Get user account by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        // Only allow users to view their own account or admins to view any account
        if (ctx.user.id !== input.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to view this account",
          });
        }

        const account = await getUserAccountById(input.id);
        if (!account) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User account not found",
          });
        }

        return {
          id: account.id,
          email: account.email,
          apiKey: account.apiKey,
          testApiKey: account.testApiKey,
          provider: account.provider,
          version: account.version,
          tier: account.tier,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user account",
          cause: error,
        });
      }
    }),

  /**
   * Regenerate API key
   */
  regenerateApiKey: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Only allow users to regenerate their own keys or admins
        if (ctx.user.id !== input.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to regenerate this API key",
          });
        }

        const account = await getUserAccountById(input.id);
        if (!account) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User account not found",
          });
        }

        const newApiKey = `sk_${uuidv4()}`;
        const updated = await updateUserAccount(input.id, {
          apiKey: newApiKey,
          version: account.version + 1,
        });

        if (!updated) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to regenerate API key",
          });
        }

        return {
          apiKey: updated.apiKey,
          version: updated.version,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to regenerate API key",
          cause: error,
        });
      }
    }),

  /**
   * Regenerate test API key
   */
  regenerateTestApiKey: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Only allow users to regenerate their own keys or admins
        if (ctx.user.id !== input.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to regenerate this test API key",
          });
        }

        const account = await getUserAccountById(input.id);
        if (!account) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User account not found",
          });
        }

        const newTestApiKey = `test_sk_${uuidv4()}`;
        const updated = await updateUserAccount(input.id, {
          testApiKey: newTestApiKey,
          version: account.version + 1,
        });

        if (!updated) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to regenerate test API key",
          });
        }

        return {
          testApiKey: updated.testApiKey,
          version: updated.version,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to regenerate test API key",
          cause: error,
        });
      }
    }),

  /**
   * Update user tier (admin only)
   */
  updateTier: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tier: z.enum(["free", "pro", "enterprise"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Only admins can update tier
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update user tier",
          });
        }

        const account = await getUserAccountById(input.id);
        if (!account) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User account not found",
          });
        }

        const updated = await updateUserAccount(input.id, {
          tier: input.tier,
        });

        if (!updated) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user tier",
          });
        }

        return {
          id: updated.id,
          tier: updated.tier,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user tier",
          cause: error,
        });
      }
    }),

  /**
   * Validate API key
   */
  validateApiKey: publicProcedure
    .input(z.object({ apiKey: z.string() }))
    .query(async ({ input }) => {
      try {
        const account = await getUserAccountByApiKey(input.apiKey);
        if (!account) {
          return { valid: false };
        }

        return {
          valid: true,
          accountId: account.id,
          tier: account.tier,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to validate API key",
          cause: error,
        });
      }
    }),
});
