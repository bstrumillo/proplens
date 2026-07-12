import { z } from "zod";

// Server-side environment validation. Imported by server-only modules (db,
// auth) so a misconfigured deploy fails at boot with a readable message
// instead of failing silently at first query.
//
// Do NOT import this from middleware or client components — middleware runs
// on the edge runtime and only needs individual process.env reads.

const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine((v) => v.startsWith("postgres"), {
      message: "DATABASE_URL must be a postgres:// connection string",
    }),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Optional pre-launch curtain in front of the whole app. Unset = disabled.
  GATE_PASSWORD: z.string().min(8).optional(),

  // Required only by the email-ingest webhook; routes fail closed without it.
  CRON_SECRET: z.string().min(16).optional(),
  DEFAULT_ORG_ID: z.string().uuid().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function loadEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid server environment:\n${details}`);
  }
  return result.data;
}

export const env = loadEnv();
