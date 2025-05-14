/**
 * Update subscription plans script
 * 
 * This script updates the subscription plans in the database with the new
 * tiered model. It includes Basic, Pro, and Enterprise tiers for
 * different subscription categories.
 */

import { db } from '../db';
import { subscriptionPlans } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function updateSubscriptionPlans() {
  console.log('Updating subscription plans...');
  
  try {
    // Get existing plans to avoid duplicates
    const existingPlans = await db.select().from(subscriptionPlans);
    const existingPlanNames = existingPlans.map(plan => plan.name);
    
    // Monthly tiers
    const basicMonthlyPlan = {
      name: "Basic",
      description: "Access to introductory AI courses, limited tool usage (5 API calls/day), and a portfolio of sample web development projects.",
      price: "19.00",
      interval: "month",
      features: [
        "5 AI course credits per month",
        "Limited tool usage (5 API calls/day)",
        "Sample web development projects",
        "Email support",
        "Community forum access"
      ],
      stripePriceId: "price_basic_monthly", // This will need to be updated with actual Stripe price ID
      isActive: true
    };
    
    const proMonthlyPlan = {
      name: "Pro",
      description: "Full access to all AI courses, unlimited tool usage, and a 10% discount on full-stack development services.",
      price: "49.00",
      interval: "month",
      features: [
        "Unlimited AI course access",
        "Unlimited tool usage",
        "10% discount on development services", 
        "Priority email support",
        "Advanced analytics dashboard",
        "Premium templates library"
      ],
      stripePriceId: "price_pro_monthly", // This will need to be updated with actual Stripe price ID
      isActive: true
    };
    
    const enterpriseMonthlyPlan = {
      name: "Enterprise",
      description: "All Pro features, plus personalized coaching, priority support, and a dedicated account manager for custom development projects.",
      price: "199.00",
      interval: "month",
      features: [
        "All Pro features",
        "Personalized coaching sessions",
        "Priority 24/7 support",
        "Dedicated account manager",
        "Custom development projects",
        "White-label solutions",
        "Team collaboration tools"
      ],
      stripePriceId: "price_enterprise_monthly", // This will need to be updated with actual Stripe price ID
      isActive: true
    };
    
    // Annual tiers (15% discount)
    const basicAnnualPlan = {
      name: "Basic Annual",
      description: "Access to introductory AI courses, limited tool usage (5 API calls/day), and a portfolio of sample web development projects. 15% off with annual billing.",
      price: "193.80", // $19 * 12 months * 0.85 (15% discount)
      interval: "year",
      features: [
        "5 AI course credits per month",
        "Limited tool usage (5 API calls/day)",
        "Sample web development projects",
        "Email support",
        "Community forum access",
        "15% annual discount"
      ],
      stripePriceId: "price_basic_annual", // This will need to be updated with actual Stripe price ID
      isActive: true
    };
    
    const proAnnualPlan = {
      name: "Pro Annual",
      description: "Full access to all AI courses, unlimited tool usage, and a 10% discount on full-stack development services. 15% off with annual billing.",
      price: "499.80", // $49 * 12 months * 0.85 (15% discount)
      interval: "year",
      features: [
        "Unlimited AI course access",
        "Unlimited tool usage",
        "10% discount on development services", 
        "Priority email support",
        "Advanced analytics dashboard",
        "Premium templates library",
        "15% annual discount"
      ],
      stripePriceId: "price_pro_annual", // This will need to be updated with actual Stripe price ID
      isActive: true
    };
    
    const enterpriseAnnualPlan = {
      name: "Enterprise Annual",
      description: "All Pro features, plus personalized coaching, priority support, and a dedicated account manager for custom development projects. 15% off with annual billing.",
      price: "2029.80", // $199 * 12 months * 0.85 (15% discount)
      interval: "year",
      features: [
        "All Pro features",
        "Personalized coaching sessions",
        "Priority 24/7 support",
        "Dedicated account manager",
        "Custom development projects",
        "White-label solutions",
        "Team collaboration tools",
        "15% annual discount"
      ],
      stripePriceId: "price_enterprise_annual", // This will need to be updated with actual Stripe price ID
      isActive: true
    };
    
    // Plans to insert
    const plansToInsert = [
      basicMonthlyPlan,
      proMonthlyPlan,
      enterpriseMonthlyPlan,
      basicAnnualPlan,
      proAnnualPlan,
      enterpriseAnnualPlan
    ].filter(plan => !existingPlanNames.includes(plan.name));
    
    // Insert new plans
    if (plansToInsert.length > 0) {
      const result = await db.insert(subscriptionPlans).values(plansToInsert);
      console.log(`Inserted ${plansToInsert.length} new subscription plans`);
    } else {
      console.log('No new plans to insert');
    }
    
    console.log('Subscription plans updated successfully');
  } catch (error) {
    console.error('Error updating subscription plans:', error);
  }
}

// Execute the function
updateSubscriptionPlans()
  .then(() => {
    console.log('Subscription plans update script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error running subscription plans update script:', error);
    process.exit(1);
  });