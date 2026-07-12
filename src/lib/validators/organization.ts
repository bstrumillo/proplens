import { z } from "zod";
import { emailSchema, phoneSchema } from "./shared";

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less"),
  email: emailSchema
    .max(255, "Email must be 255 characters or less")
    .optional()
    .or(z.literal("")),
  phone: phoneSchema,
  address: z
    .string()
    .max(1000, "Address must be 1000 characters or less")
    .optional()
    .or(z.literal("")),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
