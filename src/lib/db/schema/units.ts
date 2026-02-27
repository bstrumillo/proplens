import {
  boolean,
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
import { buildings } from "./properties";
import { unitTypeEnum, unitStatusEnum } from "./enums";

export const units = pgTable("units", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  buildingId: uuid("building_id")
    .notNull()
    .references(() => buildings.id, { onDelete: "cascade" }),
  unitNumber: varchar("unit_number", { length: 50 }).notNull(),
  type: unitTypeEnum("type").notNull(),
  status: unitStatusEnum("status").default("vacant").notNull(),
  floor: integer("floor"),
  bedrooms: integer("bedrooms"),
  bathrooms: numeric("bathrooms", { precision: 3, scale: 1 }),
  sqft: numeric("sqft", { precision: 10, scale: 2 }),
  marketRent: numeric("market_rent", { precision: 10, scale: 2 }),
  currentRent: numeric("current_rent", { precision: 10, scale: 2 }),
  depositAmount: numeric("deposit_amount", { precision: 10, scale: 2 }),
  isFurnished: boolean("is_furnished").default(false).notNull(),
  isCorporate: boolean("is_corporate").default(false).notNull(),
  amenities: jsonb("amenities").default([]).notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  currentTenantId: uuid("current_tenant_id"),
  currentLeaseId: uuid("current_lease_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
