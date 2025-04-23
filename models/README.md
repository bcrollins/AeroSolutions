# Models

This directory contains the data models and database schema definitions for the application.

## Purpose

Models define the structure and business rules for data in the application. They are responsible for:

- Defining the database schema
- Providing type definitions for TypeScript
- Implementing data validation
- Defining relationships between different data entities

## Database Schema

The application uses PostgreSQL with Drizzle ORM for database operations. The schema is defined in `schema.ts` and includes the following main entities:

### Users
- User accounts with authentication information
- Profile details
- Subscription status
- Onboarding progress

### Content and Engagement
- Posts
- Contact submissions
- Client previews
- Content view metrics
- Feedback

### E-commerce
- Marketplace items
- Marketplace orders
- Subscription plans
- User subscriptions
- Price recommendations
- Price history

### Testing and Analytics
- A/B test configurations
- A/B test results
- User sessions
- Marketing metrics

### Platform Health
- Logs
- Bug reports
- Platform compatibility issues
- Brand consistency issues

## Implementation

The models are implemented using Drizzle ORM with PostgreSQL. Each model typically includes:

1. Table definition with columns and constraints
2. Type definitions for TypeScript
3. Insert schema definitions using Zod for validation
4. Relationships with other models

## Current Status

The database schema is currently defined in the `shared/schema.ts` file and has been copied to this directory for better organization. In the future, the schema could be split into multiple files for better maintainability, with each file focusing on a specific domain of the application.

## Example Model Structure

```typescript
// Example of how a model file might look after refactoring

import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model definition
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create the insert schema for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
```