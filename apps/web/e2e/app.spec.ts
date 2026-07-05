import { test, expect } from "@playwright/test";

test.describe("Adalah Web UI", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "عدالة" })).toBeVisible();
    await expect(page.getByPlaceholder("lawyer@example.com")).toBeVisible();
  });

  test("should register and reach chat page", async ({ page }) => {
    const email = `e2e-${Date.now()}@test.com`;

    await page.goto("/register");
    await page.getByPlaceholder("محامي تجريبي").fill("مستخدم E2E");
    await page.getByPlaceholder("lawyer@example.com").fill(email);
    await page.getByPlaceholder("SecurePass1").fill("SecurePass1");
    await page.getByRole("button", { name: "تسجيل" }).click();

    await expect(page).toHaveURL(/\/chat/, { timeout: 10_000 });
    await expect(page.getByText("مرحبًا بك في عدالة")).toBeVisible();
  });

  test("should navigate to documents page", async ({ page }) => {
    const email = `docs-${Date.now()}@test.com`;

    await page.goto("/register");
    await page.getByPlaceholder("محامي تجريبي").fill("مستخدم وثائق");
    await page.getByPlaceholder("lawyer@example.com").fill(email);
    await page.getByPlaceholder("SecurePass1").fill("SecurePass1");
    await page.getByRole("button", { name: "تسجيل" }).click();
    await page.waitForURL(/\/chat/);

    await page.getByRole("link", { name: "وثائق" }).click();
    await expect(page).toHaveURL(/\/documents/);
    await expect(page.getByText("الوثائق القانونية")).toBeVisible();
  });
});
