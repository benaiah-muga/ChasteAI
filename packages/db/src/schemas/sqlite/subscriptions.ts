import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { id, timestamp, timestampNow } from "./helpers"

export const subscriptionPlans = ["free", "starter", "pro", "enterprise"] as const
export type SubscriptionPlan = (typeof subscriptionPlans)[number]

export const subscriptionStatuses = ["active", "canceled", "past_due", "incomplete", "trialing"] as const
export type SubscriptionStatus = (typeof subscriptionStatuses)[number]

export const subscriptions = sqliteTable("subscriptions", {
  id: id(),
  workspaceId: text("workspace_id").notNull().unique(),
  plan: text("plan").notNull().$type<SubscriptionPlan>().default("free"),
  status: text("status").notNull().$type<SubscriptionStatus>().default("active"),
  providerSubscriptionId: text("provider_subscription_id"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  createdAt: timestampNow("created_at"),
  updatedAt: timestampNow("updated_at"),
})
