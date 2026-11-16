import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth', 'user.json');

setup('авторизация тестового пользователя', async ({ page }) => {
  // 1. Переходим на страницу входа
  await page.goto('/login');

  // 2. Заполняем форму, используя точные тексты label из AuthField.tsx
  await page.getByLabel('Введите email:').fill('test@example.com');
  await page.getByLabel('Введите пароль:').fill('testpassword123');

  // 3. Нажимаем кнопку с точным текстом из SubmitButton
  await page.getByRole('button', { name: 'Войти' }).click();

  // 4. Ждем редиректа на главную страницу (согласно router.replace("/") в LoginForm)
  await page.waitForURL('/', { timeout: 15000 });

  // 5. Дополнительная проверка: убеждаемся, что загрузился дашборд/главная
  // (Если ваш MainDashboard находится по роуту /dashboard, замените '/' на '/dashboard' выше и здесь)
  await expect(page.getByRole('heading', { name: 'Vision Board' })).toBeVisible({ timeout: 10000 });

  // 6. Сохраняем cookies для всех последующих тестов
  await page.context().storageState({ path: authFile });
});