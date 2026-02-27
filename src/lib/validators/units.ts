import { z } from "zod";

export const unitTypeValues = [
  "apartment",
  "studio",
  "townhouse",
  "condo",
  "commercial",
  "storage",
] as const;

export const unitStatusValues = [
  "vacant",
  "occupied",
  "maintenance",
  "reserved",
  "not_rentable",
] as const;

export const createUnitSchema = z.object({
  buildingId: z.string().uuid("Please select a building"),
  unitNumber: z
    .string()
    .min(1, "Unit number is required")
    .max(50, "Unit number must be 50 characters or less"),
  type: z.enum(unitTypeValues, {
    message: "Please select a unit type",
  }),
  floor: z.coerce
    .number()
    .int()
    .optional()
    .or(z.literal("")),
  bedrooms: z.coerce
    .number()
    .int()
    .min(0, "Bedrooms must be 0 or more")
    .optional()
    .or(z.literal("")),
  bathrooms: z
    .string()
    .regex(/^\d+(\.\d)?$/, "Must be a valid number")
    .optional()
    .or(z.literal("")),
  sqft: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid number")
    .optional()
    .or(z.literal("")),
  marketRent: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid currency amount")
    .optional()
    .or(z.literal("")),
  currentRent: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid currency amount")
    .optional()
    .or(z.literal("")),
  depositAmount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid currency amount")
    .optional()
    .or(z.literal("")),
  isFurnished: z
    .union([z.boolean(), z.literal("true"), z.literal("false")])
    .transform((val) => val === true || val === "true")
    .default(false),
  isCorporate: z
    .union([z.boolean(), z.literal("true"), z.literal("false")])
    .transform((val) => val === true || val === "true")
    .default(false),
  description: z.string().max(5000).optional().or(z.literal("")),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;

export const updateUnitSchema = createUnitSchema.partial();

export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
