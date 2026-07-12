import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  "postgresql://postgres@localhost:5433/proplens_e2e";

// Pre-provisioned chromium in sandboxed environments where downloads are
// blocked; CI installs the matching browser via `playwright install`.
const localChromium = "/opt/pw-browsers/chromium";
const useLocalChromium = !process.env.CI && existsSync(localChromium);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    ...(useLocalChromium
      ? { launchOptions: { executablePath: localChromium } }
      : {}),
  },
  webServer: {
    command: `npm run db:migrate && npm run dev -- --port ${PORT}`,
    url: `${baseURL}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      DATABASE_URL: E2E_DATABASE_URL,
      BETTER_AUTH_SECRET: "e2e-secret-for-playwright-min-32-chars-ok",
      NEXT_PUBLIC_APP_URL: baseURL,
      BETTER_AUTH_URL: baseURL,
    },
  },
});
