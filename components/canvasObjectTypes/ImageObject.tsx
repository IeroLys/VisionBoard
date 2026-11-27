import type { ImageObject as I } from "./types";

export default function TestCircleObject({ obj }: { obj: I }) {
  return (
    <img
      src={obj.url}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "fill",
        pointerEvents: "none",
        userSelect: "none"
      }} 
      draggable={false}
    />
  );
}
