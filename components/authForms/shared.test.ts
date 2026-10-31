import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateRequired,
  compactErrors,
  authErrorMessage,
} from './shared';

describe('Функции валидации и утилиты', () => {
  describe('validateEmail', () => {
    it('возвращает ошибку для пустой строки', () => {
      expect(validateEmail('')).toBe('Поле обязательно для заполнения');
    });
    it('возвращает ошибку для неверного формата', () => {
      expect(validateEmail('not-an-email')).toBe('Неверный формат email');
    });
    it('возвращает undefined для валидного email', () => {
      expect(validateEmail('test@example.com')).toBeUndefined();
    });
  });

  describe('validatePassword', () => {
    it('возвращает ошибку для пустой строки', () => {
      expect(validatePassword('')).toBe('Поле обязательно для заполнения');
    });
    it('возвращает ошибку для короткого пароля', () => {
      expect(validatePassword('123')).toBe('Пароль должен содержать от 8 до 30 символов');
    });
    it('возвращает undefined для валидного пароля', () => {
      expect(validatePassword('ValidPass123')).toBeUndefined();
    });
  });

  describe('validateRequired', () => {
    it('возвращает ошибку для пустой строки', () => {
      expect(validateRequired('')).toBe('Поле обязательно для заполнения');
    });
    it('возвращает undefined для заполненного значения', () => {
      expect(validateRequired('Иван')).toBeUndefined();
    });
  });

  describe('compactErrors', () => {
    it('удаляет undefined значения из объекта ошибок', () => {
      const errors = { email: undefined, password: 'Ошибка' };
      expect(compactErrors(errors)).toEqual({ password: 'Ошибка' });
    });
    it('возвращает пустой объект, если все значения undefined', () => {
      expect(compactErrors({ email: undefined })).toEqual({});
    });
  });

  describe('authErrorMessage', () => {
    it('возвращает сообщение по коду ошибки', () => {
      expect(authErrorMessage({ code: 'INVALID_EMAIL_OR_PASSWORD' }, 'Fallback')).toBe('Неверный email или пароль.');
    });
    it('возвращает message, если кода нет в словаре', () => {
      expect(authErrorMessage({ message: 'Custom error' }, 'Fallback')).toBe('Custom error');
    });
    it('возвращает fallback, если нет ни кода, ни message', () => {
      expect(authErrorMessage({}, 'Fallback')).toBe('Fallback');
    });
  });
});