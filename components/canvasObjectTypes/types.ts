export type BaseObject = {
  id: string;
  x: number;       
  y: number;
  width: number;
  height: number;
};

export type TestRectangleObject = BaseObject & {
  type: "testRectangle";
};

export type TestCircleObject = BaseObject & {
  type: "testCircle";
};

export type CanvasObject = TestRectangleObject | TestCircleObject;