import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

// Runs once before the test suite: applies all migrations to the test
// database. Doubles as a continuous check that migration files stay valid.

export default async function setup() {
  const url =
    process.env.TEST_DATABASE_URL ??
    "postgresql://postgres@localhost:5433/proplens_test";

  const dbName = new URL(url).pathname.slice(1);
  if (!dbName.endsWith("_test")) {
    throw new Error(
      `Refusing to run tests against "${dbName}" — the test database name must end with "_test".`
    );
  }

  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: "src/lib/db/migrations" });
  await pool.end();
}
