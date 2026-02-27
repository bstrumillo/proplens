import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { communicationTypeEnum, communicationStatusEnum } from "./enums";

export const communications = pgTable("communications", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  type: communicationTypeEnum("type").notNull(),
  status: communicationStatusEnum("status").default("draft").notNull(),
  subject: varchar("subject", { length: 500 }),
  body: text("body"),
  recipientType: varchar("recipient_type", { length: 50 }),
  recipientId: uuid("recipient_id"),
  recipientAddress: varchar("recipient_address", { length: 255 }),
  sentBy: varchar("sent_by", { length: 255 }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  externalId: varchar("external_id", { length: 255 }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  failureReason: text("failure_reason"),
  relatedType: varchar("related_type", { length: 50 }),
  relatedId: uuid("related_id"),
  templateId: uuid("template_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const communicationTemplates = pgTable("communication_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: communicationTypeEnum("type").notNull(),
  subject: varchar("subject", { length: 500 }),
  body: text("body"),
  variables: jsonb("variables").default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
