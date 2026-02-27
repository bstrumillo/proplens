import {
  date,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  // PII fields
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  dateOfBirth: date("date_of_birth"),
  // PII encrypted
  ssnEncrypted: varchar("ssn_encrypted", { length: 500 }),
  // Auth link
  userId: varchar("user_id", { length: 255 }),
  // Emergency contact (PII)
  emergencyName: varchar("emergency_name", { length: 200 }),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),
  emergencyRelation: varchar("emergency_relation", { length: 100 }),
  // Employment
  employer: varchar("employer", { length: 255 }),
  // PII encrypted
  annualIncomeEncrypted: varchar("annual_income_encrypted", { length: 500 }),
  // General
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
