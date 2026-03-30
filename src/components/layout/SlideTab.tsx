import { useWindowSlide } from "../../hooks/useWindowSlide";
import { useStore } from "../../stores/store";

export function SlideTab() {
  const { toggle, isSlid } = useWindowSlide();
  const edge = useStore((s) => s.windowConfig.edge);
  const handleThickness = useStore((s) => s.windowConfig.handleThickness);
  const handleLength = useStore((s) => s.windowConfig.handleLength);
  const alignment = useStore((s) => s.windowConfig.alignment);
  const handleColor = useStore((s) => s.windowConfig.handleColor);

  const isHorizontal = edge === "top" || edge === "bottom";

  const getArrowPoints = () => {
    if (isSlid) {
      switch (edge) {
        case "right": return "9 18 15 12 9 6";
        case "left": return "15 18 9 12 15 6";
        case "top": return "18 15 12 9 6 15";
        case "bottom": return "18 9 12 15 6 9";
      }
    } else {
      switch (edge) {
        case "right": return "15 18 9 12 15 6";
        case "left": return "9 18 15 12 9 6";
        case "top": return "18 9 12 15 6 9";
        case "bottom": return "18 15 12 9 6 15";
      }
    }
  };

  const size: React.CSSProperties = isHorizontal
    ? { width: `${handleLength}px`, height: `${handleThickness}px`, flexShrink: 0 }
    : { width: `${handleThickness}px`, height: `${handleLength}px`, flexShrink: 0 };

  const alignSelf = isSlid
    ? alignment === "start" ? "flex-start" : alignment === "end" ? "flex-end" : "center"
    : undefined;

  // Round only the corners on the side away from the screen edge (the inside).
  // The side touching the panel (or screen edge when collapsed) stays flat.
  // Handle is on the inside, so the side facing away from the panel gets rounded.
  // For right edge: handle is on left, panel is on right → round left corners only
  // For left edge: handle is on right, panel is on left → round right corners only
  // For top edge: handle is below panel → round bottom corners only
  // For bottom edge: handle is above panel → round top corners only
  const borderRadius = {
    right: "4px 0 0 4px",
    left: "0 4px 4px 0",
    top: "0 0 4px 4px",
    bottom: "4px 4px 0 0",
  }[edge];

  return (
    <button
      onClick={toggle}
      style={{ ...size, alignSelf, backgroundColor: handleColor, borderRadius, border: "none", outline: "none" }}
      className="flex items-center justify-center cursor-pointer appearance-none p-0 m-0"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-app opacity-60"
      >
        <polyline points={getArrowPoints()} />
      </svg>
    </button>
  );
}
