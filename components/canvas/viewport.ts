import { Point, Shape, Viewport } from './types';

export function screenToWorld(screen: Point, viewport: Viewport): Point {
  return {
    x: (screen.x - viewport.x) / viewport.scale,
    y: (screen.y - viewport.y) / viewport.scale,
  };
}

export function hitTestRect(
  point: Point,
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  return (
    point.x >= x &&
    point.x <= x + width &&
    point.y >= y &&
    point.y <= y + height
  );
}

// Добавлен хит-тест для круга
export function hitTestCircle(
  point: Point,
  cx: number,
  cy: number,
  radius: number
): boolean {
  const dx = point.x - cx;
  const dy = point.y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

export function hitTestShape(point: Point, shape: Shape): boolean {
  if (shape.type === 'rect') {
    return hitTestRect(point, shape.x, shape.y, shape.width, shape.height);
  }
  return hitTestCircle(
    point,
    shape.x + shape.width / 2,
    shape.y + shape.height / 2,
    shape.width / 2
  );
}