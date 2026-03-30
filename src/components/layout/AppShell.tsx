import { SlideTab } from "./SlideTab";
import { TitleBar } from "./TitleBar";
import { useStore } from "../../stores/store";
import { quitApp } from "../../lib/tauri";

export function AppShell({ children }: { children: React.ReactNode }) {
  const isSlid = useStore((s) => s.isSlid);
  const edge = useStore((s) => s.windowConfig.edge);
  const panelColor = useStore((s) => s.windowConfig.panelColor);
  const view = useStore((s) => s.view);

  const isHorizontal = edge === "top" || edge === "bottom";

  const roundingClass = {
    right: "rounded-l-lg",
    left: "rounded-r-lg",
    top: "rounded-b-lg",
    bottom: "rounded-t-lg",
  }[edge];

  const panel = (
    <div
      style={{ backgroundColor: isSlid ? panelColor : "transparent" }}
      className={`flex flex-col flex-1 min-w-0 min-h-0 text-app ${isSlid ? roundingClass : ""} overflow-hidden relative`}
    >
      {isSlid && (
        <>
          <TitleBar />
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
          {view === "vault-list" && (
            <button
              onClick={() => quitApp()}
              className="absolute bottom-3 right-3 p-2 text-app-faint hover:text-red-400 transition-colors cursor-pointer rounded-full hover:bg-black/10"
              title="Quit Sidewinder"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                <line x1="12" y1="2" x2="12" y2="12" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );

  const handle = (
    <div className="flex shrink-0 items-center justify-center">
      <SlideTab />
    </div>
  );

  if (isHorizontal) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-transparent">
        {edge === "top" ? <>{panel}{handle}</> : <>{handle}{panel}</>}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-transparent">
      {edge === "left" ? <>{panel}{handle}</> : <>{handle}{panel}</>}
    </div>
  );
}
