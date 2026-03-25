import { useStore } from "../../stores/store";

export function TitleBar() {
  const view = useStore((s) => s.view);
  const goBack = useStore((s) => s.goBack);
  const getActiveVault = useStore((s) => s.getActiveVault);

  const vault = getActiveVault();
  const title =
    view === "vault-list"
      ? "Sidewinder"
      : view === "note-list"
        ? vault?.name || "Notes"
        : vault?.name || "Note";

  return (
    <div
      data-tauri-drag-region
      className="h-10 flex items-center justify-between px-3
                 bg-slate-800/80 border-b border-slate-700/50 select-none shrink-0"
    >
      <div className="flex items-center gap-2">
        {view !== "vault-list" && (
          <button
            onClick={goBack}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <span
          data-tauri-drag-region
          className="text-sm font-medium text-slate-300"
        >
          {title}
        </span>
      </div>
    </div>
  );
}
