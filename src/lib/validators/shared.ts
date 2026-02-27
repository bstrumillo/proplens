import { z } from "zod";

export const uuidSchema = z.string().uuid("Invalid ID format");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-().]{7,20}$/, "Invalid phone number")
  .optional()
  .or(z.literal(""));

export const emailSchema = z.string().email("Invalid email address");

export const currencySchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Invalid currency amount")
  .transform((val) => val);

export const dateSchema = z.string().date("Invalid date format (YYYY-MM-DD)");

export const optionalDateSchema = dateSchema.optional().or(z.literal(""));
