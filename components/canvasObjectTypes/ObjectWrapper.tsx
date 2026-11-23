import type { CanvasObject } from "./types";
import TestCircleObject from "./TestCircleObject";
import TestRectangleObject from "./TestRectangleObject";

type Props = {
  obj: CanvasObject;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
};


{/* Обертка для любых объектов. Добавляет возможность выделения и удаления */}
function renderContent(obj: CanvasObject) {
  switch (obj.type) {
    case "testCircle":
      return <TestCircleObject obj={obj} />;
    case "testRectangle":
      return <TestRectangleObject obj={obj} />;
    default:
      const _: never = obj;
      return _;
  }
}

export default function ObjectWrapper({ obj, isSelected, onSelect, onDelete }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        left: obj.x,
        top: obj.y,
        width: obj.width,
        height: obj.height,
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {renderContent(obj)}

      {isSelected && (
        <>
          <div
            style={{
              position: "absolute",
              inset: -4,
              border: "2px dashed #6B78E5",
              pointerEvents: "none",
            }}
          />
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Удалить"
            style={{
              position: "absolute",
              top: -15,
              right: -15,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#6B78E5",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}