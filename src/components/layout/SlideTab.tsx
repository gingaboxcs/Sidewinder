import { useWindowSlide } from "../../hooks/useWindowSlide";

export function SlideTab() {
  const { toggle, isSlid } = useWindowSlide();

  return (
    <button
      onClick={toggle}
      className="w-[30px] min-w-[30px] h-full flex items-center justify-center
                 bg-gradient-to-r from-slate-800 to-slate-700
                 hover:from-slate-700 hover:to-slate-600
                 border-r border-slate-600/50 cursor-pointer
                 transition-colors duration-200"
      title={isSlid ? "Hide panel" : "Show panel"}
    >
      <div className="flex flex-col items-center gap-1">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-slate-300 transition-transform duration-300 ${
            isSlid ? "rotate-180" : ""
          }`}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span
          className="text-slate-400 text-[9px] font-bold tracking-widest"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          S
        </span>
      </div>
    </button>
  );
}
