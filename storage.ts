/**
 * Storage Interface for Database Operations
 * 
 * This module defines the interface for storage operations and provides
 * an implementation using Drizzle ORM with PostgreSQL.
 */

import { users, type User, type InsertUser } from "./shared/schema";
import { db } from "./server/db";
import { eq } from "drizzle-orm";

/**
 * Interface for storage operations
 */
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

/**
 * Database storage implementation using Drizzle ORM
 */
export class DatabaseStorage implements IStorage {
  /**
   * Get user by ID
   * @param id - User ID
   * @returns User object or undefined
   */
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  /**
   * Get user by username
   * @param username - Username
   * @returns User object or undefined
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  /**
   * Create a new user
   * @param insertUser - User data to insert
   * @returns Created user object
   */
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();