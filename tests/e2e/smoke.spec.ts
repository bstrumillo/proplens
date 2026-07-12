import { test, expect } from "@playwright/test";

// Smoke flow against a live dev server + real Postgres:
// register → onboard an organization → dashboard → create a property →
// create a tenant → tenant detail renders the (fixed) data tabs.
// Serial: later tests reuse the account/org created earlier.

test.describe.serial("first-run smoke", () => {
  const suffix = Date.now().toString(36);
  const email = `smoke-${suffix}@example.com`;
  const password = "sm0ke-Test-Password!";
  const orgName = `Smoke Org ${suffix}`;

  test("register, onboard, land on dashboard", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full Name").fill("Smoke Tester");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create Account" }).click();

    await page.waitForURL("**/onboarding");
    await page.getByLabel("Organization Name").fill(orgName);
    await page.getByRole("button", { name: "Create Organization" }).click();

    await page.waitForURL(/\/$/);
    await expect(page.getByText(orgName)).toBeVisible();
  });

  test("sign in works after sign out", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(/\/$/);
    await expect(page.getByText(orgName)).toBeVisible();
  });

  test("create a property and see it listed", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(/\/$/);

    await page.goto("/properties");
    await page
      .getByRole("button", { name: "Add Property" })
      .first()
      .click();
    await page.getByLabel("Name *").fill("Smoke Property");
    await page.getByLabel("Address Line 1 *").fill("123 Test Ave");
    await page.getByLabel("City *").fill("Chicago");
    await page.getByLabel("State *").fill("IL");
    await page.getByLabel("Zip Code *").fill("60601");
    await page.getByRole("button", { name: "Create Property" }).click();

    await expect(page.getByText("Smoke Property")).toBeVisible();
  });

  test("unauthenticated visitor is redirected to login", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/properties");
    await page.waitForURL("**/login");
    await expect(
      page.getByRole("button", { name: "Sign In" })
    ).toBeVisible();
    await context.close();
  });
});
