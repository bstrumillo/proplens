import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    globalSetup: ["tests/helpers/global-setup.ts"],
    // Test files share one database; run them sequentially so truncation
    // in one file can't race queries in another.
    fileParallelism: false,
    testTimeout: 15_000,
    env: {
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        "postgresql://postgres@localhost:5433/proplens_test",
      BETTER_AUTH_SECRET: "test-secret-for-vitest-min-32-characters-ok",
    },
  },
});
