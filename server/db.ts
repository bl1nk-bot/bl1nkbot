import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, userAccounts, InsertUserAccount, UserAccount } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new user account with email and password
 */
export async function createUserAccount(data: InsertUserAccount): Promise<UserAccount | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user account: database not available");
    return null;
  }

  try {
    const result = await db.insert(userAccounts).values(data);
    const created = await db.select().from(userAccounts).where(eq(userAccounts.id, result[0].insertId)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create user account:", error);
    throw error;
  }
}

/**
 * Get user account by email
 */
export async function getUserAccountByEmail(email: string): Promise<UserAccount | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user account: database not available");
    return null;
  }

  try {
    const result = await db.select().from(userAccounts).where(eq(userAccounts.email, email)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user account:", error);
    throw error;
  }
}

/**
 * Get user account by API key
 */
export async function getUserAccountByApiKey(apiKey: string): Promise<UserAccount | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user account: database not available");
    return null;
  }

  try {
    const result = await db.select().from(userAccounts).where(eq(userAccounts.apiKey, apiKey)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user account:", error);
    throw error;
  }
}

/**
 * Update user account
 */
export async function updateUserAccount(id: number, data: Partial<InsertUserAccount>): Promise<UserAccount | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user account: database not available");
    return null;
  }

  try {
    await db.update(userAccounts).set(data).where(eq(userAccounts.id, id));
    const updated = await db.select().from(userAccounts).where(eq(userAccounts.id, id)).limit(1);
    return updated.length > 0 ? updated[0] : null;
  } catch (error) {
    console.error("[Database] Failed to update user account:", error);
    throw error;
  }
}

/**
 * Get user account by ID
 */
export async function getUserAccountById(id: number): Promise<UserAccount | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user account: database not available");
    return null;
  }

  try {
    const result = await db.select().from(userAccounts).where(eq(userAccounts.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user account:", error);
    throw error;
  }
}

// TODO: add feature queries here as your schema grows.
