/**
 * Storage Interface for Database Operations
 * 
 * This module defines the interface for storage operations and provides
 * an implementation using Drizzle ORM with PostgreSQL.
 */

import { users, type User, type InsertUser,
         contactSubmissions, type Contact, type InsertContact,
         openaiRequests, type OpenaiRequest, type InsertOpenaiRequest } from "../shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import bcrypt from 'bcrypt';

/**
 * Interface for storage operations
 */
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Contact methods
  createContactSubmission(contact: InsertContact): Promise<Contact>;
  getContactSubmissions(): Promise<Contact[]>;
  getContactById(id: number): Promise<Contact | undefined>;
  updateContact(id: number): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;
  
  // OpenAI methods
  createOpenAIRequest(request: InsertOpenaiRequest): Promise<OpenaiRequest>;
  getOpenAIRequests(limit?: number): Promise<OpenaiRequest[]>;
  getOpenAIRequestById(id: number): Promise<OpenaiRequest | undefined>;
  
  // Sample data initialization
  initSampleData(): Promise<void>;
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

  /**
   * Create a contact submission
   * @param contact - Contact data to insert
   * @returns Created contact submission
   */
  async createContactSubmission(contact: InsertContact): Promise<Contact> {
    const [submission] = await db
      .insert(contactSubmissions)
      .values(contact)
      .returning();
    return submission;
  }

  /**
   * Get all contact submissions
   * @returns Array of contact submissions
   */
  async getContactSubmissions(): Promise<Contact[]> {
    return await db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt));
  }

  /**
   * Get contact submission by ID
   * @param id - Contact submission ID
   * @returns Contact submission or undefined
   */
  async getContactById(id: number): Promise<Contact | undefined> {
    const [contact] = await db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id));
    return contact;
  }

  /**
   * Update contact submission (for example, would add status)
   * @param id - Contact submission ID
   * @returns Updated contact submission or undefined
   */
  async updateContact(id: number): Promise<Contact | undefined> {
    // This is a placeholder - with the current database schema there's
    // no status column to update, but keeping the method signature for future enhancement
    const [contact] = await db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id));
    return contact;
  }

  /**
   * Delete contact submission
   * @param id - Contact submission ID
   * @returns True if deleted successfully
   */
  async deleteContact(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(contactSubmissions)
      .where(eq(contactSubmissions.id, id))
      .returning();
    return !!deleted;
  }

  /**
   * Create OpenAI request record
   * @param request - OpenAI request data
   * @returns Created OpenAI request record
   */
  async createOpenAIRequest(request: InsertOpenaiRequest): Promise<OpenaiRequest> {
    const [record] = await db
      .insert(openaiRequests)
      .values(request)
      .returning();
    return record;
  }

  /**
   * Get all OpenAI requests with optional limit
   * @param limit - Optional maximum number of records to return
   * @returns Array of OpenAI request records
   */
  async getOpenAIRequests(limit?: number): Promise<OpenaiRequest[]> {
    const query = db
      .select()
      .from(openaiRequests)
      .orderBy(desc(openaiRequests.createdAt));
    
    // Apply limit if provided
    if (limit !== undefined) {
      return await query.limit(limit);
    }
    
    return await query;
  }

  /**
   * Get OpenAI request by ID
   * @param id - OpenAI request ID
   * @returns OpenAI request record or undefined
   */
  async getOpenAIRequestById(id: number): Promise<OpenaiRequest | undefined> {
    const [request] = await db
      .select()
      .from(openaiRequests)
      .where(eq(openaiRequests.id, id));
    return request;
  }

  /**
   * Initialize sample data for testing
   */
  async initSampleData(): Promise<void> {
    try {
      // Check if admin user exists
      const adminExists = await this.getUserByUsername('admin');
      
      if (!adminExists) {
        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await this.createUser({
          username: 'admin',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'admin'
        });
        
        console.log('Created admin user');
      }
      
      // Create sample contact submission if none exist
      const contactCount = await db.select().from(contactSubmissions);
      
      if (contactCount.length === 0) {
        await this.createContactSubmission({
          name: 'John Doe',
          email: 'john@example.com',
          company: 'Example Corp',
          message: 'I would like to learn more about your OpenAI API service.'
        });
        
        console.log('Created sample contact submission');
      }
      
      // Note: We don't need to create sample OpenAI requests as they will be generated naturally through API usage
      
    } catch (error) {
      console.error('Error initializing sample data:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();