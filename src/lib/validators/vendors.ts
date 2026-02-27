import { z } from "zod";
import { emailSchema, phoneSchema, optionalDateSchema } from "./shared";

export const createVendorSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less"),
  companyName: z.string().max(255).optional().or(z.literal("")),
  email: emailSchema.optional().or(z.literal("")),
  phone: phoneSchema,
  address: z.string().optional().or(z.literal("")),
  specialties: z.string().optional().or(z.literal("")),
  licenseNumber: z.string().max(100).optional().or(z.literal("")),
  insuranceExpiry: optionalDateSchema,
  hourlyRate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid rate")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const updateVendorSchema = createVendorSchema.partial();

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
