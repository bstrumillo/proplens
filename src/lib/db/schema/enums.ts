import { pgEnum } from "drizzle-orm/pg-core";

// ── User & Organization ──────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", [
  "owner",
  "admin",
  "manager",
  "staff",
  "viewer",
]);

// ── Property ─────────────────────────────────────────────────────────
export const propertyTypeEnum = pgEnum("property_type", [
  "residential",
  "commercial",
  "mixed_use",
  "industrial",
]);

export const propertyStatusEnum = pgEnum("property_status", [
  "active",
  "inactive",
  "under_renovation",
  "for_sale",
]);

// ── Unit ─────────────────────────────────────────────────────────────
export const unitStatusEnum = pgEnum("unit_status", [
  "vacant",
  "occupied",
  "maintenance",
  "reserved",
  "not_rentable",
]);

export const unitTypeEnum = pgEnum("unit_type", [
  "apartment",
  "studio",
  "townhouse",
  "condo",
  "commercial",
  "storage",
]);

// ── Lease ────────────────────────────────────────────────────────────
export const leaseStatusEnum = pgEnum("lease_status", [
  "draft",
  "active",
  "expired",
  "terminated",
  "renewed",
]);

export const leaseTypeEnum = pgEnum("lease_type", [
  "fixed",
  "month_to_month",
  "corporate",
  "student",
  "section8",
]);

// ── Payment ──────────────────────────────────────────────────────────
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "refunded",
  "cancelled",
]);

export const paymentMethodTypeEnum = pgEnum("payment_method_type", [
  "ach",
  "credit_card",
  "debit_card",
  "check",
  "cash",
  "wire",
  "other",
]);

// ── Maintenance ──────────────────────────────────────────────────────
export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "submitted",
  "acknowledged",
  "in_progress",
  "on_hold",
  "completed",
  "closed",
  "cancelled",
]);

export const maintenancePriorityEnum = pgEnum("maintenance_priority", [
  "emergency",
  "urgent",
  "high",
  "medium",
  "low",
]);

// ── Work Order ───────────────────────────────────────────────────────
export const workOrderStatusEnum = pgEnum("work_order_status", [
  "created",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
]);

// ── Communication ────────────────────────────────────────────────────
export const communicationTypeEnum = pgEnum("communication_type", [
  "email",
  "sms",
  "in_app",
  "push",
]);

export const communicationStatusEnum = pgEnum("communication_status", [
  "draft",
  "queued",
  "sent",
  "delivered",
  "failed",
  "bounced",
]);

// ── Financial ────────────────────────────────────────────────────────
export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
  "transfer",
  "refund",
  "adjustment",
]);

// ── Vendor ───────────────────────────────────────────────────────────
export const vendorStatusEnum = pgEnum("vendor_status", [
  "active",
  "inactive",
  "suspended",
]);
