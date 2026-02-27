import {
  boolean,
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
import { units } from "./units";
import { tenants } from "./tenants";
import { leaseStatusEnum, leaseTypeEnum } from "./enums";

export const leases = pgTable("leases", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  unitId: uuid("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "restrict" }),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "restrict" }),
  status: leaseStatusEnum("status").default("draft").notNull(),
  type: leaseTypeEnum("type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  monthlyRent: numeric("monthly_rent", { precision: 10, scale: 2 }).notNull(),
  securityDeposit: numeric("security_deposit", { precision: 10, scale: 2 }),
  petDeposit: numeric("pet_deposit", { precision: 10, scale: 2 }),
  furnishedPremium: numeric("furnished_premium", { precision: 10, scale: 2 }),
  rentDueDay: integer("rent_due_day").default(1).notNull(),
  lateFeeAmount: numeric("late_fee_amount", { precision: 10, scale: 2 }),
  lateFeeGraceDays: integer("late_fee_grace_days").default(5).notNull(),
  autoRenew: boolean("auto_renew").default(false).notNull(),
  renewalTerms: text("renewal_terms"),
  previousLeaseId: uuid("previous_lease_id"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  signedByTenant: timestamp("signed_by_tenant", { withTimezone: true }),
  signedByManager: timestamp("signed_by_manager", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const leaseDocuments = pgTable("lease_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  leaseId: uuid("lease_id")
    .notNull()
    .references(() => leases.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  uploadedBy: varchar("uploaded_by", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
