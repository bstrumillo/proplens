import { z } from "zod";

export const propertyTypeValues = [
  "residential",
  "commercial",
  "mixed_use",
  "industrial",
] as const;

export const propertyStatusValues = [
  "active",
  "inactive",
  "under_renovation",
  "for_sale",
] as const;

export const createPropertySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less"),
  addressLine1: z
    .string()
    .min(1, "Address is required")
    .max(255, "Address must be 255 characters or less"),
  addressLine2: z.string().max(255).optional().or(z.literal("")),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be 100 characters or less"),
  state: z
    .string()
    .min(1, "State is required")
    .max(50, "State must be 50 characters or less"),
  zipCode: z
    .string()
    .min(1, "Zip code is required")
    .max(20, "Zip code must be 20 characters or less"),
  type: z.enum(propertyTypeValues, {
    message: "Please select a property type",
  }),
  yearBuilt: z.coerce
    .number()
    .int()
    .min(1800, "Year must be 1800 or later")
    .max(new Date().getFullYear() + 5, "Year cannot be that far in the future")
    .optional()
    .or(z.literal("")),
  totalSqft: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid number")
    .optional()
    .or(z.literal("")),
  purchasePrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid currency amount")
    .optional()
    .or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

export const updatePropertySchema = createPropertySchema.partial();

export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

export const createBuildingSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less"),
  addressLine1: z
    .string()
    .max(255, "Address must be 255 characters or less")
    .optional()
    .or(z.literal("")),
  totalUnits: z.coerce
    .number()
    .int()
    .min(0, "Units must be 0 or more")
    .default(0),
  floors: z.coerce
    .number()
    .int()
    .min(1, "Floors must be at least 1")
    .optional()
    .or(z.literal("")),
  yearBuilt: z.coerce
    .number()
    .int()
    .min(1800, "Year must be 1800 or later")
    .max(new Date().getFullYear() + 5, "Year cannot be that far in the future")
    .optional()
    .or(z.literal("")),
});

export type CreateBuildingInput = z.infer<typeof createBuildingSchema>;

export const updateBuildingSchema = createBuildingSchema.partial();

export type UpdateBuildingInput = z.infer<typeof updateBuildingSchema>;
