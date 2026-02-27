import {
  boolean,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { leases } from "./leases";
import { tenants } from "./tenants";
import { paymentStatusEnum, paymentMethodTypeEnum } from "./enums";

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  leaseId: uuid("lease_id")
    .notNull()
    .references(() => leases.id, { onDelete: "restrict" }),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  method: paymentMethodTypeEnum("method"),
  type: varchar("type", { length: 50 }).notNull(), // rent, late_fee, security_deposit, etc.
  periodStart: timestamp("period_start", { withTimezone: true }),
  periodEnd: timestamp("period_end", { withTimezone: true }),
  dueDate: timestamp("due_date", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }),
  lateFeeApplied: numeric("late_fee_applied", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  type: paymentMethodTypeEnum("type").notNull(),
  stripeMethodId: varchar("stripe_method_id", { length: 255 }),
  last4: varchar("last4", { length: 4 }),
  brand: varchar("brand", { length: 50 }),
  expiryMonth: varchar("expiry_month", { length: 2 }),
  expiryYear: varchar("expiry_year", { length: 4 }),
  bankName: varchar("bank_name", { length: 255 }),
  isDefault: boolean("is_default").default(false).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
