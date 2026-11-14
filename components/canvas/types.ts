export interface Point {
  x: number;
  y: number;
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface Shape {
  id: string;
  type: 'rect' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

// Инструменты соответствуют макету тулбара
export type Tool = 'select' | 'brush' | 'text' | 'image' | 'rect' | 'circle';