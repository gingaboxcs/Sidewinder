import { useWindowSlide } from "../../hooks/useWindowSlide";
import { useStore } from "../../stores/store";

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function SlideTab() {
  const { toggle, isSlid } = useWindowSlide();
  const edge = useStore((s) => s.windowConfig.edge);
  const handleThickness = useStore((s) => s.windowConfig.handleThickness);
  const handleLength = useStore((s) => s.windowConfig.handleLength);
  const alignment = useStore((s) => s.windowConfig.alignment);
  const handleColor = useStore((s) => s.windowConfig.handleColor);
  const vibrancy = useStore((s) => s.windowConfig.vibrancy);

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

  const borderRadius = {
    right: "4px 0 0 4px",
    left: "0 4px 4px 0",
    top: "0 0 4px 4px",
    bottom: "4px 4px 0 0",
  }[edge];

  const bgColor = vibrancy ? hexToRgba(handleColor, 0.8) : handleColor;

  const style: React.CSSProperties = {
    ...size,
    alignSelf,
    backgroundColor: bgColor,
    borderRadius,
    border: "none",
    outline: "none",
    ...(vibrancy ? {
      backdropFilter: "blur(30px) saturate(180%)",
      WebkitBackdropFilter: "blur(30px) saturate(180%)",
    } : {}),
  };

  return (
    <button
      onClick={toggle}
      style={style}
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
