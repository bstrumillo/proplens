import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { and, eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

// Links an already-registered user to an existing organization as owner.
// Needed once after enabling real auth: the seeded org predates any real
// user account, so the first registered account has no membership.
//
// Usage: npx tsx scripts/link-owner.ts <email> [org-slug]
//        (org-slug defaults to double-jack-properties)

async function main() {
  const [email, slugArg] = process.argv.slice(2);
  const slug = slugArg ?? "double-jack-properties";

  if (!email) {
    console.error("Usage: npx tsx scripts/link-owner.ts <email> [org-slug]");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  const [user] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, email))
    .limit(1);

  if (!user) {
    console.error(
      `No user found with email ${email}. Register through the app first.`
    );
    process.exit(1);
  }

  const [org] = await db
    .select()
    .from(schema.organizations)
    .where(eq(schema.organizations.slug, slug))
    .limit(1);

  if (!org) {
    console.error(`No organization found with slug "${slug}".`);
    process.exit(1);
  }

  const [existing] = await db
    .select()
    .from(schema.organizationMembers)
    .where(
      and(
        eq(schema.organizationMembers.userId, user.id),
        eq(schema.organizationMembers.organizationId, org.id)
      )
    )
    .limit(1);

  if (existing) {
    console.log(
      `${email} is already a member of ${org.name} (role: ${existing.role}).`
    );
  } else {
    await db.insert(schema.organizationMembers).values({
      organizationId: org.id,
      userId: user.id,
      role: "owner",
      isDefault: true,
      acceptedAt: new Date(),
    });
    console.log(`Linked ${email} to ${org.name} as owner.`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
