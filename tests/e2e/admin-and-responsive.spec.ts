import { expect, test } from "@playwright/test";

test.describe("production UI smoke and security boundaries", () => {
  test("admin login remains usable without horizontal overflow", async ({ page }) => {
    await page.goto("/admin-login");
    await expect(page).toHaveTitle(/Grace Sessions/);
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in with passkey/i })).toBeVisible();
    await expect(page.locator("input").first()).toBeVisible();

    const viewport = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }));
    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.width + 1);
    expect(viewport.height).toBeGreaterThan(0);
  });

  test("admin route is protected before the private workspace renders", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin-login(?:\?|$)/);
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("admin API rejects unauthenticated access", async ({ request }) => {
    const response = await request.get("/api/admin/appointments");
    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Admin access is required." });
  });

  test("baseline security headers are present", async ({ request }) => {
    const response = await request.get("/admin-login");
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response.headers()["x-frame-options"]).toBe("DENY");
    expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(response.headers()["permissions-policy"]).toContain("camera=()");
    expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  });
});
