import {
  timestamp,
  pgTable,
  text,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./user";

/**
 * Subscription Events Table
 * Tracks all Stripe webhook events for audit trail and idempotency
 */
export const subscriptionEvents = pgTable("subscription_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: text("userId").references(() => users.id, { onDelete: "cascade" }),

  // Stripe event ID for idempotency (prevents duplicate processing)
  stripeEventId: text("stripeEventId").unique().notNull(),

  // Event type (e.g., "checkout.session.completed", "customer.subscription.updated")
  eventType: text("eventType").notNull(),

  // Full Stripe event payload for debugging and audit trail
  payload: jsonb("payload").notNull(),

  // Processing metadata
  processedAt: timestamp("processedAt", { mode: "date" }).defaultNow(),
  processingStatus: text("processingStatus").default("success").notNull(), // 'pending', 'success', 'failed'
  errorMessage: text("errorMessage"),
});
