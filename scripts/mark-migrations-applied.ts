import "dotenv/config";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";

// One-time adoption script for databases that predate migration files
// (they were created with `drizzle-kit push`). Records every local migration
// as already-applied WITHOUT running it, so future `npm run db:migrate`
// starts from the next migration instead of failing on CREATE TABLE.
//
// Only run this against a database whose schema already matches the
// migrations being marked (run `npm run db:push` first to sync).
//
// Usage: npx tsx scripts/mark-migrations-applied.ts

const MIGRATIONS_DIR = join(process.cwd(), "src/lib/db/migrations");

type JournalEntry = { idx: number; when: number; tag: string };

async function main() {
  const journal = JSON.parse(
    readFileSync(join(MIGRATIONS_DIR, "meta/_journal.json"), "utf8")
  ) as { entries: JournalEntry[] };

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  await pool.query(`CREATE SCHEMA IF NOT EXISTS "drizzle"`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);

  const { rows } = await pool.query(
    `SELECT created_at FROM "drizzle"."__drizzle_migrations"`
  );
  const applied = new Set(rows.map((r) => String(r.created_at)));

  for (const entry of journal.entries) {
    if (applied.has(String(entry.when))) {
      console.log(`~ ${entry.tag} already recorded, skipping`);
      continue;
    }
    const sql = readFileSync(join(MIGRATIONS_DIR, `${entry.tag}.sql`), "utf8");
    const hash = createHash("sha256").update(sql).digest("hex");
    await pool.query(
      `INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
      [hash, entry.when]
    );
    console.log(`✓ marked ${entry.tag} as applied`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
