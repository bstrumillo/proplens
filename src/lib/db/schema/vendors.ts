import {
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { vendorStatusEnum } from "./enums";

export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  specialties: jsonb("specialties").default([]).notNull(),
  licenseNumber: varchar("license_number", { length: 100 }),
  insuranceExpiry: date("insurance_expiry"),
  status: vendorStatusEnum("status").default("active").notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  totalJobs: integer("total_jobs").default(0).notNull(),
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }),
  // PII encrypted
  taxIdEncrypted: varchar("tax_id_encrypted", { length: 500 }),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const vendorContracts = pgTable("vendor_contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  vendorId: uuid("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  contractAmount: numeric("contract_amount", { precision: 12, scale: 2 }),
  paymentTerms: text("payment_terms"),
  fileUrl: varchar("file_url", { length: 500 }),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
