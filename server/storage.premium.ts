import { eq } from "drizzle-orm";
import { db } from "./db";
import { aiCourses } from "@shared/schema";

// Methods to support premium course access
export async function getCourse(id: number): Promise<any> {
  try {
    const [course] = await db
      .select()
      .from(aiCourses)
      .where(eq(aiCourses.id, id));
    
    return course;
  } catch (error) {
    console.error(`Error getting course with id ${id}:`, error);
    return null;
  }
}

export async function checkUserSubscription(userId: string, requiredPlan: string): Promise<boolean> {
  try {
    // This is a simplified implementation
    // In a real production app, this would check the user's subscription in the database
    
    // For testing purposes, we'll allow any authenticated user to access
    // courses that require 'basic' level access, but restrict 'pro' and 'enterprise'
    if (requiredPlan === 'basic') {
      return true;
    }
    
    // For demo, we'll assume some users have premium access
    // In a real implementation, we'd check against active subscriptions in the database
    const premiumUserIds = ['927070657', '123456789'];
    return premiumUserIds.includes(userId);
  } catch (error) {
    console.error(`Error checking subscription for user ${userId}:`, error);
    return false;
  }
}