import { z } from "zod";

export const leaseStatusValues = [
  "draft",
  "active",
  "expired",
  "terminated",
  "renewed",
] as const;

export const leaseTypeValues = [
  "fixed",
  "month_to_month",
  "corporate",
  "student",
  "section8",
] as const;

export const createLeaseSchema = z.object({
  unitId: z.string().uuid("Please select a unit"),
  tenantId: z.string().uuid("Please select a tenant"),
  type: z.enum(leaseTypeValues, {
    message: "Please select a lease type",
  }),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  monthlyRent: z
    .string()
    .min(1, "Monthly rent is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid currency amount"),
  securityDeposit: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid currency amount")
    .optional()
    .or(z.literal("")),
  petDeposit: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid currency amount")
    .optional()
    .or(z.literal("")),
  furnishedPremium: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid currency amount")
    .optional()
    .or(z.literal("")),
  rentDueDay: z.coerce
    .number()
    .int()
    .min(1, "Must be between 1 and 28")
    .max(28, "Must be between 1 and 28")
    .default(1),
  lateFeeAmount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid currency amount")
    .optional()
    .or(z.literal("")),
  lateFeeGraceDays: z.coerce
    .number()
    .int()
    .min(0, "Must be 0 or more")
    .default(5),
  autoRenew: z
    .union([z.boolean(), z.string()])
    .transform((val) => val === true || val === "true" || val === "on")
    .default(false),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export type CreateLeaseInput = z.infer<typeof createLeaseSchema>;

export const updateLeaseSchema = createLeaseSchema.partial().extend({
  status: z.enum(leaseStatusValues).optional(),
});

export type UpdateLeaseInput = z.infer<typeof updateLeaseSchema>;
