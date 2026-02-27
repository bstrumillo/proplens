import { z } from "zod";
import { emailSchema, phoneSchema, optionalDateSchema } from "./shared";

export const createTenantSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be 100 characters or less"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be 100 characters or less"),
  email: emailSchema,
  phone: phoneSchema,
  dateOfBirth: optionalDateSchema,
  emergencyName: z.string().max(200).optional().or(z.literal("")),
  emergencyPhone: phoneSchema,
  emergencyRelation: z.string().max(100).optional().or(z.literal("")),
  employer: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const updateTenantSchema = createTenantSchema.partial();

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
