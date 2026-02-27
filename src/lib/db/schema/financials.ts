import {
  boolean,
  date,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { properties } from "./properties";
import { transactionTypeEnum } from "./enums";

export const financialCategories = pgTable("financial_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  parentId: uuid("parent_id"),
  code: varchar("code", { length: 50 }),
  description: text("description"),
  isSystem: boolean("is_system").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const financialTransactions = pgTable("financial_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id").references(() => properties.id, {
    onDelete: "set null",
  }),
  categoryId: uuid("category_id").references(() => financialCategories.id, {
    onDelete: "set null",
  }),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  date: date("date").notNull(),
  description: text("description"),
  paymentId: uuid("payment_id"),
  vendorId: uuid("vendor_id"),
  bankTransactionId: varchar("bank_transaction_id", { length: 255 }),
  isReconciled: boolean("is_reconciled").default(false).notNull(),
  reconciledAt: timestamp("reconciled_at", { withTimezone: true }),
  reference: varchar("reference", { length: 255 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const bankConnections = pgTable("bank_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  // PII encrypted
  plaidItemIdEncrypted: varchar("plaid_item_id_encrypted", { length: 500 }),
  plaidAccessTokenEncrypted: varchar("plaid_access_token_encrypted", {
    length: 500,
  }),
  institutionName: varchar("institution_name", { length: 255 }),
  institutionId: varchar("institution_id", { length: 100 }),
  accountMask: varchar("account_mask", { length: 4 }),
  accountName: varchar("account_name", { length: 255 }),
  accountType: varchar("account_type", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  errorCode: varchar("error_code", { length: 100 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
