import { test, expect } from '@playwright/test';

test.describe('Дашборд Vision Board (Авторизованный пользователь)', () => {
  
  test('должен корректно отображать главную страницу после входа', async ({ page }) => {
    // Благодаря auth.setup.ts, мы уже авторизованы. 
    // Просто переходим на главную (или /dashboard, если роутинг настроен так)
    await page.goto('/');

    // Проверяем заголовок из MainDashboard.tsx
    await expect(page.getByRole('heading', { name: 'Vision Board' })).toBeVisible();
    
    // Проверяем ссылку на пользователя (из вашего кода: текст "Имя пользователя" или реальное имя)
    await expect(page.getByRole('link', { name: /имя пользователя|test@example.com/i })).toBeVisible();
  });

  test('должен отображать кнопку создания проекта', async ({ page }) => {
    await page.goto('/');

    // В вашем MainDashboard.tsx мы добавили aria-label="Создать проект"
    const createBtn = page.getByRole('button', { name: 'Создать проект' });
    await expect(createBtn).toBeVisible();
  });

  test('визуальная регрессия: главная страница должна выглядеть корректно', async ({ page }) => {
    await page.goto('/');
    
    // При первом запуске создаст эталонный скриншот. 
    // При последующих — сравнит с ним и упадет, если верстка сломается.
    await expect(page).toHaveScreenshot('main-page.png', {
      maxDiffPixelRatio: 0.02, // Допускаем 2% отличий из-за рендеринга шрифтов в разных ОС
    });
  });
});