import { z } from "zod";
import { uuidSchema } from "./shared";

const CATEGORIES = [
  "plumbing",
  "electrical",
  "hvac",
  "appliance",
  "structural",
  "pest",
  "general",
  "other",
] as const;

const PRIORITIES = [
  "emergency",
  "urgent",
  "high",
  "medium",
  "low",
] as const;

const STATUSES = [
  "submitted",
  "acknowledged",
  "in_progress",
  "on_hold",
  "completed",
  "closed",
  "cancelled",
] as const;

export const createMaintenanceRequestSchema = z.object({
  unitId: uuidSchema,
  tenantId: z.string().uuid("Invalid tenant ID").optional().or(z.literal("")),
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  description: z.string().optional().or(z.literal("")),
  category: z.enum(CATEGORIES).optional().or(z.literal("")),
  priority: z.enum(PRIORITIES),
  estimatedCost: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid cost amount")
    .optional()
    .or(z.literal("")),
  entryPermission: z.string().optional().or(z.literal("")),
});

export const updateMaintenanceRequestSchema = createMaintenanceRequestSchema
  .partial()
  .extend({
    status: z.enum(STATUSES).optional(),
    assignedTo: z.string().max(255).optional().or(z.literal("")),
    actualCost: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Invalid cost amount")
      .optional()
      .or(z.literal("")),
  });

export type CreateMaintenanceRequestInput = z.infer<typeof createMaintenanceRequestSchema>;
export type UpdateMaintenanceRequestInput = z.infer<typeof updateMaintenanceRequestSchema>;

export { CATEGORIES, PRIORITIES, STATUSES };
