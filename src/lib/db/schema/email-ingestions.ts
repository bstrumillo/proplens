import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const emailIngestions = pgTable("email_ingestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  gmailMessageId: varchar("gmail_message_id", { length: 255 })
    .notNull()
    .unique(),
  subject: varchar("subject", { length: 500 }),
  sender: varchar("sender", { length: 255 }),
  receivedAt: timestamp("received_at", { withTimezone: true }),
  attachmentName: varchar("attachment_name", { length: 255 }),
  reportType: varchar("report_type", { length: 50 }),
  rowCount: integer("row_count"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  errorMessage: text("error_message"),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  stats: jsonb("stats"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
