import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto("/");
  });

  test("should navigate to sign up page and create account", async ({
    page,
  }) => {
    // Click sign up button in navigation
    await page.click("text=Sign Up");

    // Fill out the registration form
    await page.fill('[name="name"]', "Test User");
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', "testpassword123");
    await page.fill('[name="confirmPassword"]', "testpassword123");

    // Submit the form
    await page.click('button:has-text("Create Account")');

    // Should show success message
    await expect(
      page.locator("text=Account created successfully")
    ).toBeVisible();

    // Should redirect to sign in page
    await expect(page).toHaveURL("/signin");
  });

  test("should sign in with valid credentials", async ({ page }) => {
    // Navigate to sign in page
    await page.goto("/signin");

    // Fill out the sign in form
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "testpassword123");

    // Submit the form
    await page.click('button:has-text("Sign In")');

    // Should redirect to home page and show user is logged in
    await expect(page).toHaveURL("/");
    await expect(page.locator("text=Welcome,")).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    // Navigate to sign in page
    await page.goto("/signin");

    // Fill out the sign in form with invalid credentials
    await page.fill('[name="email"]', "invalid@example.com");
    await page.fill('[name="password"]', "wrongpassword");

    // Submit the form
    await page.click('button:has-text("Sign In")');

    // Should show error message
    await expect(page.locator("text=Invalid email or password")).toBeVisible();
  });

  test("should access profile page when authenticated", async ({ page }) => {
    // First sign in
    await page.goto("/signin");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "testpassword123");
    await page.click('button:has-text("Sign In")');

    // Wait for redirect to home page
    await expect(page).toHaveURL("/");

    // Click on user menu
    await page.click('[aria-label="account of current user"]');

    // Click profile option
    await page.click("text=Profile");

    // Should navigate to profile page
    await expect(page).toHaveURL("/profile");
    await expect(page.locator('h4:has-text("Test User")')).toBeVisible();
  });

  test("should sign out successfully", async ({ page }) => {
    // First sign in
    await page.goto("/signin");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "testpassword123");
    await page.click('button:has-text("Sign In")');

    // Wait for redirect to home page
    await expect(page).toHaveURL("/");

    // Click on user menu
    await page.click('[aria-label="account of current user"]');

    // Click sign out option
    await page.click("text=Sign Out");

    // Should redirect to home page and show sign in/sign up buttons
    await expect(page).toHaveURL("/");
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('button:has-text("Sign Up")')).toBeVisible();
  });

  test("should redirect to sign in when accessing protected routes", async ({
    page,
  }) => {
    // Try to access profile page without authentication
    await page.goto("/profile");

    // Should redirect to sign in page
    await expect(page).toHaveURL("/signin");
  });
});
