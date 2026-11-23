import type { TestRectangleObject as T } from "./types";

export default function TestRectangleObject({ obj }: { obj: T }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "blue",
      }}
    />
  );
}
