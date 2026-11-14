/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**', '**/e2e/**', '**/dist/**'],
    
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Включаем только те директории, которые реально покрываем юнит-тестами
      include: [
        'components/**/*.{ts,tsx}', 
        'hooks/**/*.{ts,tsx}',
        'lib/format.ts', // Единственный lib-файл, который имеет смысл тестировать юнит-тестами
      ],
      // ИСКЛЮЧАЕМ из расчета покрытия файлы, которые не являются бизнес-логикой фронтенда:
      exclude: [
        'components/ui/**',             // Готовые UI-компоненты (shadcn и т.п.)
        'components/theme-provider.tsx', // Простой провайдер контекста
        'lib/actions/**',               // Server Actions (работают с БД, требуют интеграционных тестов)
        'lib/server/**',                // Серверные утилиты
        'lib/auth.ts',                  // Конфигурация аутентификации
        'lib/auth-client.ts',           // Клиент аутентификации
        'lib/utils.ts',                 // Обычно это просто функция cn()
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});