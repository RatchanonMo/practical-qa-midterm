import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * Target: https://demoqa.com/automation-practice-form
 * Midterm Exam - Automated Testing
 */
export default defineConfig({
  globalSetup: './global-setup.ts',
  testDir: './tests',
  // Maximum time per test
  timeout: 60_000,
  // Maximum time for all tests to run
  globalTimeout: 600_000,
  // Expect timeout for assertions
  expect: {
    timeout: 10_000,
  },
  // Fail the build on test failures
  fullyParallel: false,
  // Retry failed tests
  retries: 1,
  // Limit parallel workers to 1 to avoid overloading demoqa
  workers: 1,
  // HTML reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'https://demoqa.com',
    // Capture trace on failure
    trace: 'on-first-retry',
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    // Video recording
    video: 'off',
    // Viewport size
    viewport: { width: 1280, height: 800 },
    // Action timeout
    actionTimeout: 15_000,
    // Navigation timeout
    navigationTimeout: 30_000,
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
