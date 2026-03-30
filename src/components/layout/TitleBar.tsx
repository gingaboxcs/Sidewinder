import { useStore } from "../../stores/store";
import { TrophyIcon } from "../elysium/ElysiumIcons";
import { t } from "../../lib/i18n";

export function TitleBar() {
  const view = useStore((s) => s.view);
  useStore((s) => s.language); // subscribe to trigger re-render on language change
  const goBack = useStore((s) => s.goBack);
  const setView = useStore((s) => s.setView);
  const getActiveVault = useStore((s) => s.getActiveVault);
  const activeVaultId = useStore((s) => s.activeVaultId);
  const currentFolderPath = useStore((s) => s.currentFolderPath);
  const setCurrentFolderPath = useStore((s) => s.setCurrentFolderPath);
  const elysiumEnabled = useStore((s) => s.elysiumConfig.enabled);

  const vault = getActiveVault();
  const isElysiumVault = activeVaultId?.startsWith("elysium-");

  // Get the current folder name for display
  const currentFolderName = currentFolderPath
    ? currentFolderPath.substring(currentFolderPath.lastIndexOf("/") + 1)
    : null;

  const title =
    view === "vault-list"
      ? t("sidewinder")
      : view === "settings"
        ? t("settings")
        : view === "calendar"
          ? t("calendar")
          : view === "search"
            ? t("search")
            : view === "note-list"
            ? (currentFolderName || vault?.name || "Notes")
            : vault?.name || "Note";

  // Back button handler: if in a subfolder, go up one level; otherwise use goBack
  const handleBack = () => {
    if (view === "note-list" && currentFolderPath && vault) {
      const parent = currentFolderPath.substring(0, currentFolderPath.lastIndexOf("/"));
      if (parent === vault.path || parent.length < vault.path.length) {
        setCurrentFolderPath(null);
      } else {
        setCurrentFolderPath(parent);
      }
    } else {
      goBack();
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="h-10 flex items-center justify-between px-3
                 bg-white/5 select-none shrink-0"
    >
      <div className="flex items-center gap-2 min-w-0">
        {view !== "vault-list" && (
          <button
            onClick={handleBack}
            className="text-app-muted hover:text-app transition-colors p-1 cursor-pointer shrink-0"
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <span data-tauri-drag-region className="text-sm font-medium text-app flex items-center gap-1.5 truncate">
          {isElysiumVault && <TrophyIcon size={14} />}
          {view === "note-list" && currentFolderName && (
            <span className="text-app-faint">{vault?.name} /</span>
          )}
          {title}
        </span>
      </div>

      {view === "vault-list" && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView("search")}
            className="text-app-faint hover:text-app transition-colors p-1 cursor-pointer"
            title="Search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          {elysiumEnabled && (
            <button
              onClick={() => setView("calendar")}
              className="text-app-faint hover:text-app transition-colors p-1 cursor-pointer"
              title="Calendar"
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setView("settings")}
            className="text-app-faint hover:text-app transition-colors p-1 cursor-pointer"
            title="Settings"
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
