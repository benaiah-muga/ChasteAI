import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core"

export const subscriptionPlans = ["free", "starter", "pro", "enterprise"] as const
export type SubscriptionPlan = (typeof subscriptionPlans)[number]

export const subscriptionStatuses = ["active", "canceled", "past_due", "incomplete", "trialing"] as const
export type SubscriptionStatus = (typeof subscriptionStatuses)[number]

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().unique(),
  plan: text("plan").notNull().$type<SubscriptionPlan>().default("free"),
  status: text("status").notNull().$type<SubscriptionStatus>().default("active"),
  providerSubscriptionId: text("provider_subscription_id"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
