import { SlideTab } from "./SlideTab";
import { TitleBar } from "./TitleBar";
import { useStore } from "../../stores/store";
import { quitApp } from "../../lib/tauri";
import { t } from "../../lib/i18n";

const isWindows = navigator.userAgent.includes("Windows");

export function AppShell({ children }: { children: React.ReactNode }) {
  const isSlid = useStore((s) => s.isSlid);
  const edge = useStore((s) => s.windowConfig.edge);
  const panelColor = useStore((s) => s.windowConfig.panelColor);
  const view = useStore((s) => s.view);

  const isHorizontal = edge === "top" || edge === "bottom";

  // Windows uses resize sliding: when collapsed, the window is sized to the
  // handle only. Render just the handle so no panel layout flashes during
  // the shrink animation and no opaque background pixels leak around it.
  if (isWindows && !isSlid) {
    return (
      <div className="h-screen w-screen overflow-hidden flex items-center justify-center">
        <SlideTab />
      </div>
    );
  }


  // No rounded corners on Windows - they create visible gaps since the
  // window can't be truly transparent (WebView2 limitation).
  const roundingClass = isWindows ? "" : {
    right: "rounded-l-lg",
    left: "rounded-r-lg",
    top: "rounded-b-lg",
    bottom: "rounded-t-lg",
  }[edge];

  const panelStyle: React.CSSProperties = {
    backgroundColor: isSlid ? panelColor : "transparent",
  };

  const panel = (
    <div
      style={panelStyle}
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
              title={t("quitSidewinder")}
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

  // On Windows when open, handle column background matches panel so the handle
  // appears embedded at the panel edge (no visible column behind/around it).
  const handleColumnBg = isWindows && isSlid ? panelColor : undefined;

  const handle = (
    <div
      className="flex shrink-0 items-center justify-center"
      style={handleColumnBg ? { backgroundColor: handleColumnBg } : undefined}
    >
      <SlideTab />
    </div>
  );

  if (isHorizontal) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden ">
        {edge === "top" ? <>{panel}{handle}</> : <>{handle}{panel}</>}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden ">
      {edge === "left" ? <>{panel}{handle}</> : <>{handle}{panel}</>}
    </div>
  );
}
