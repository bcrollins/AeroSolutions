import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from 'zod';

/**
 * User model
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  openaiRequests: many(openaiRequests)
}));

// User schema for insert operations
export const userInsertSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof userInsertSchema>;

/**
 * Contact submission model
 */
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Contact schema for insert operations
export const contactInsertSchema = createInsertSchema(contactSubmissions)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Type definitions
export type Contact = typeof contactSubmissions.$inferSelect;
export type InsertContact = z.infer<typeof contactInsertSchema>;

/**
 * OpenAI request model
 */
export const openaiRequests = pgTable("openai_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(),
  prompt: text("prompt").notNull(),
  model: text("model").notNull(),
  response: text("response"),
  tokens: integer("tokens").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// OpenAI request relations
export const openaiRequestsRelations = relations(openaiRequests, ({ one }) => ({
  user: one(users, {
    fields: [openaiRequests.userId],
    references: [users.id]
  })
}));

// OpenAI request schema for insert operations
export const openaiRequestInsertSchema = createInsertSchema(openaiRequests)
  .omit({ id: true, createdAt: true });

// Type definitions
export type OpenaiRequest = typeof openaiRequests.$inferSelect;
export type InsertOpenaiRequest = z.infer<typeof openaiRequestInsertSchema>;

/**
 * Subscription model
 */
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  plan: text("plan").notNull(),
  status: text("status").default("active").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Subscription relations
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id]
  })
}));

// Subscription schema for insert operations
export const subscriptionInsertSchema = createInsertSchema(subscriptions)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Type definitions
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof subscriptionInsertSchema>;