import type { TestCircleObject as T } from "./types";

export default function TestCircleObject({ obj }: { obj: T }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background: "blue",
      }}
    />
  );
}
