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

    await expect(page).toHaveURL(/\/chat/, { timeout: 30_000 });
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

    await page.getByRole("link", { name: "وثائق" }).first().click();
    await expect(page).toHaveURL(/\/documents/);
    await expect(page.getByText("الوثائق القانونية")).toBeVisible();
  });

  test("should navigate to profile page", async ({ page }) => {
    const email = `profile-${Date.now()}@test.com`;

    await page.goto("/register");
    await page.getByPlaceholder("محامي تجريبي").fill("مستخدم ملف");
    await page.getByPlaceholder("lawyer@example.com").fill(email);
    await page.getByPlaceholder("SecurePass1").fill("SecurePass1");
    await page.getByRole("button", { name: "تسجيل" }).click();
    await page.waitForURL(/\/chat/);

    await page.getByRole("link", { name: "حسابي" }).first().click();
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByText("الملف الشخصي")).toBeVisible();
  });

  test("should complete lawyer onboarding and reach dashboard", async ({ page }) => {
    const email = `lawyer-${Date.now()}@test.com`;

    await page.goto("/register");
    await page.getByRole("button", { name: "محامٍ" }).click();
    await page.getByPlaceholder("محامي تجريبي").fill("محامٍ E2E");
    await page.getByPlaceholder("lawyer@example.com").fill(email);
    await page.getByPlaceholder("SecurePass1").fill("SecurePass1");
    await page.getByRole("button", { name: "تسجيل" }).click();
    await page.waitForURL(/\/onboarding/);

    await page.getByPlaceholder("LIC-12345").fill("LIC-E2E-001");
    await page.getByPlaceholder("قانون العمل").fill("قانون العمل");
    await page.getByPlaceholder("نقابة المحامين السعوديين").fill("نقابة الرياض");
    await page.getByRole("button", { name: "إكمال التسجيل" }).click();
    await page.waitForURL(/\/dashboard/);

    await expect(page.getByText("لوحة التحكم")).toBeVisible();
    await expect(page.getByText("الملف المهني")).toBeVisible();
  });

  test("should analyze uploaded document", async ({ page }) => {
    const email = `analyze-${Date.now()}@test.com`;

    await page.goto("/register");
    await page.getByPlaceholder("محامي تجريبي").fill("مستخدم تحليل");
    await page.getByPlaceholder("lawyer@example.com").fill(email);
    await page.getByPlaceholder("SecurePass1").fill("SecurePass1");
    await page.getByRole("button", { name: "تسجيل" }).click();
    await page.waitForURL(/\/chat/);

    await page.getByRole("link", { name: "وثائق" }).first().click();
    await expect(page).toHaveURL(/\/documents/);

    await page.getByPlaceholder("نظام العمل السعودي").fill("عقد تجريبي");
    await page
      .getByPlaceholder("المادة 77: للعامل الحق في...")
      .fill("البند 1: يلتزم الطرف الأول بالدفع. البند 2: مدة العقد سنة.");
    await page.getByRole("button", { name: "رفع وفهرسة" }).click();

    await expect(page.getByText("جاهزة")).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: "تحليل" }).click();
    await expect(page.getByText("نتيجة التحليل")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("ملخص تجريبي")).toBeVisible();
  });

  test("should search legislation corpus without uploading documents", async ({ page }) => {
    const email = `leg-${Date.now()}@test.com`;

    await page.goto("/register");
    await page.getByPlaceholder("محامي تجريبي").fill("مستخدم تشريعات");
    await page.getByPlaceholder("lawyer@example.com").fill(email);
    await page.getByPlaceholder("SecurePass1").fill("SecurePass1");
    await page.getByRole("button", { name: "تسجيل" }).click();
    await page.waitForURL(/\/chat/);

    await page.getByRole("link", { name: "بحث" }).first().click();
    await page.getByRole("button", { name: "التشريعات" }).click();
    await page.getByPlaceholder("مثال: إجازة سنوية").fill("محامٍ");
    await page.getByRole("button", { name: "بحث" }).click();

    await expect(page.getByText("الإجراءات الجزائية")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("article").first().getByText("تشريع")).toBeVisible();
  });
});
