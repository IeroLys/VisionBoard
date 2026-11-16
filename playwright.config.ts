import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'blob' : 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // 1. Сначала выполняем авторизацию и сохраняем состояние
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // 2. Основные тесты используют сохранённую авторизацию
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  // 🚀 Тестовый сервер
  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180000, // 3 минуты на сборку Next.js
    env: {
      NODE_ENV: 'test',
    },
  },
});