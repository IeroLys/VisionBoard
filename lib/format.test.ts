import { describe, it, expect } from 'vitest';
import { formatDateRu, pluralRu } from './format';

describe('Утилиты форматирования', () => {
  describe('pluralRu', () => {
    it('возвращает первую форму для чисел, оканчивающихся на 1 (кроме 11)', () => {
      expect(pluralRu(1, ['холст', 'холста', 'холстов'])).toBe('холст');
      expect(pluralRu(21, ['холст', 'холста', 'холстов'])).toBe('холст');
      expect(pluralRu(101, ['холст', 'холста', 'холстов'])).toBe('холст');
    });

    it('возвращает вторую форму для чисел, оканчивающихся на 2, 3, 4 (кроме 12-14)', () => {
      expect(pluralRu(2, ['холст', 'холста', 'холстов'])).toBe('холста');
      expect(pluralRu(3, ['холст', 'холста', 'холстов'])).toBe('холста');
      expect(pluralRu(4, ['холст', 'холста', 'холстов'])).toBe('холста');
      expect(pluralRu(22, ['холст', 'холста', 'холстов'])).toBe('холста');
    });

    it('возвращает третью форму для 0, 5-9 и 11-14', () => {
      expect(pluralRu(0, ['холст', 'холста', 'холстов'])).toBe('холстов');
      expect(pluralRu(5, ['холст', 'холста', 'холстов'])).toBe('холстов');
      expect(pluralRu(11, ['холст', 'холста', 'холстов'])).toBe('холстов');
      expect(pluralRu(14, ['холст', 'холста', 'холстов'])).toBe('холстов');
      expect(pluralRu(20, ['холст', 'холста', 'холстов'])).toBe('холстов');
    });
  });

  describe('formatDateRu', () => {
    it('корректно форматирует ISO-строку с длинным названием месяца', () => {
      const isoDate = '2024-01-15T10:00:00.000Z';
      const result = formatDateRu(isoDate);
      
      // Intl.DateTimeFormat с month: "long" вернет что-то вроде "15 января 2024 г."
      // Используем toContain для надежности, так как пробелы могут быть неразрывными (nbsp)
      expect(result).toContain('15');
      expect(result.toLowerCase()).toContain('января');
      expect(result).toContain('2024');
    });

    it('корректно принимает и форматирует объект Date', () => {
      const dateObj = new Date('2023-03-08T00:00:00.000Z');
      const result = formatDateRu(dateObj);
      
      expect(result).toContain('8');
      expect(result.toLowerCase()).toContain('марта');
      expect(result).toContain('2023');
    });
  });
});