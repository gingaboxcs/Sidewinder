import { useState, useEffect, useCallback } from "react";
import { useStore } from "../../stores/store";
import { createFolder, updateVault, loadConfig } from "../../lib/tauri";
import { useNotes } from "../../hooks/useNotes";
import { t } from "../../lib/i18n";
import type { SortMode } from "../../types";

function getSortLabels(): Record<SortMode, string> {
  return {
    alphabetical: t("alphabetical"),
    modified: t("recent"),
    manual: t("manual"),
  };
}

export function NoteListHeader() {
  const getActiveVault = useStore((s) => s.getActiveVault);
  const setVaults = useStore((s) => s.setVaults);
  const setCreatingNote = useStore((s) => s.setCreatingNote);
  const currentFolderPath = useStore((s) => s.currentFolderPath);
  const { refreshNotes } = useNotes();

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderError, setFolderError] = useState("");

  const vault = getActiveVault();
  if (!vault) return null;

  const activePath = currentFolderPath || vault.path;

  // Folder override for current path
  const folderRelPath = currentFolderPath
    ? currentFolderPath.replace(vault.path, "").replace(/^[/\\]/, "").replace(/\\/g, "/")
    : "";
  const folderOverride = folderRelPath ? vault.folderOverrides?.[folderRelPath] : undefined;
  const effectiveSortMode = folderOverride?.sortMode || vault.sortMode;
  const effectiveSortDescending = folderOverride?.sortDescending ?? (vault.sortDescending ?? true);

  const handleQuickCreate = useCallback(() => {
    setCreatingNote(true);
  }, [setCreatingNote]);

  // Listen for keyboard shortcut events
  useEffect(() => {
    const onNewNote = () => handleQuickCreate();
    const onNewFolder = () => setShowNewFolder(true);
    window.addEventListener("sidewinder:new-note", onNewNote);
    window.addEventListener("sidewinder:new-folder", onNewFolder);
    return () => {
      window.removeEventListener("sidewinder:new-note", onNewNote);
      window.removeEventListener("sidewinder:new-folder", onNewFolder);
    };
  }, [handleQuickCreate]);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    setFolderError("");
    try {
      await createFolder(activePath, folderName.trim());
      setFolderName("");
      setShowNewFolder(false);
      refreshNotes();
    } catch (e: any) {
      setFolderError(e?.toString() || "Failed to create folder");
    }
  };

  const saveFolderOverride = async (updates: Partial<typeof folderOverride>) => {
    if (!folderRelPath) {
      // At vault root — update vault directly
      const updated = { ...vault, ...updates };
      await updateVault(updated);
    } else {
      // In subfolder — update folder override
      const existing = vault.folderOverrides?.[folderRelPath] || {};
      const updated = {
        ...vault,
        folderOverrides: {
          ...vault.folderOverrides,
          [folderRelPath]: { ...existing, ...updates },
        },
      };
      await updateVault(updated);
    }
    const config = await loadConfig();
    setVaults(config.vaults);
  };

  const handleSortChange = async (mode: SortMode) => {
    try {
      if (folderRelPath) {
        await saveFolderOverride({ sortMode: mode });
      } else {
        await updateVault({ ...vault, sortMode: mode });
        const config = await loadConfig();
        setVaults(config.vaults);
      }
    } catch (e) {
      console.error("Failed to update sort mode:", e);
    }
  };

  const cycleSortMode = () => {
    const modes: SortMode[] = ["alphabetical", "modified", "manual"];
    const idx = modes.indexOf(effectiveSortMode);
    const next = modes[(idx + 1) % modes.length];
    handleSortChange(next);
  };

  return (
    <div className="px-3 pt-3 pb-1">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-app-muted uppercase tracking-wider">
            {t("notes")}
          </h2>
          <button
            onClick={cycleSortMode}
            className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-app-faint
                       hover:text-app hover:bg-neutral-700 transition-colors cursor-pointer"
            title={`${t("sort")}: ${getSortLabels()[effectiveSortMode]} (${t("clickToCycle")})`}
          >
            {getSortLabels()[effectiveSortMode]}
          </button>
          {effectiveSortMode !== "manual" && (
            <button
              onClick={async () => {
                const next = !effectiveSortDescending;
                try {
                  await saveFolderOverride({ sortDescending: next });
                } catch (e) { console.error(e); }
              }}
              className="text-app-faint hover:text-app cursor-pointer p-0.5 transition-colors"
              title={effectiveSortDescending
                ? (effectiveSortMode === "modified" ? t("newestFirst") : t("zFirst"))
                : (effectiveSortMode === "modified" ? t("oldestFirst") : t("aFirst"))
              }
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   className={`transition-transform ${effectiveSortDescending ? "" : "rotate-180"}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNewFolder(!showNewFolder)}
            className="p-1 text-app-faint hover:text-app transition-colors cursor-pointer"
            title={t("newFolder")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </button>
          <button
            onClick={handleQuickCreate}
            className="text-xs px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700
                       border border-neutral-700 hover:border-neutral-600
                       rounded text-app transition-colors cursor-pointer"
          >
            {t("addNote")}
          </button>
        </div>
      </div>

      {showNewFolder && (
        <div className="mb-2">
          <div className="flex gap-2">
            <input
              autoFocus
              value={folderName}
              onChange={(e) => { setFolderName(e.target.value); setFolderError(""); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") { setShowNewFolder(false); setFolderName(""); setFolderError(""); }
              }}
              placeholder={t("folderName")}
              className="flex-1 bg-black/20 border border-neutral-700 rounded px-2.5 py-1.5
                         text-sm text-app focus:outline-none focus:border-neutral-500"
            />
            <button
              onClick={handleCreateFolder}
              style={{ backgroundColor: "var(--accent)" }}
              className="px-3 py-1.5 rounded text-sm text-white cursor-pointer"
            >
              {t("create")}
            </button>
          </div>
          {folderError && <p className="text-xs text-red-400 mt-1">{folderError}</p>}
        </div>
      )}
    </div>
  );
}
