import { useState, useEffect } from "react";
import { useStore } from "../../stores/store";
import { moveNote, moveFolder, listFolderContents } from "../../lib/tauri";
import { useNotes } from "../../hooks/useNotes";
import type { FolderEntry } from "../../types";

interface Props {
  notePath: string | null;
  noteFilename: string;
  isFolder?: boolean;
  onClose: () => void;
}

export function MoveNoteDialog({ notePath, noteFilename, isFolder, onClose }: Props) {
  const vaults = useStore((s) => s.vaults);
  const activeVaultId = useStore((s) => s.activeVaultId);
  const { refreshNotes } = useNotes();

  const [browsePath, setBrowsePath] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [error, setError] = useState("");
  const [moving, setMoving] = useState(false);

  // Load subfolders when browsing a directory
  useEffect(() => {
    if (!browsePath) {
      setFolders([]);
      return;
    }
    listFolderContents(browsePath).then(([folderList]) => {
      setFolders(folderList);
    }).catch(console.error);
  }, [browsePath]);

  if (!notePath) return null;

  // Current note's directory
  const noteDir = notePath.substring(0, notePath.lastIndexOf("/"));

  const handleMove = async (destDir: string) => {
    if (destDir === noteDir) {
      setError("Note is already in this folder");
      return;
    }
    setError("");
    setMoving(true);
    try {
      if (isFolder) {
        await moveFolder(notePath, destDir);
      } else {
        await moveNote(notePath, destDir);
      }
      await refreshNotes();
      onClose();
    } catch (e: any) {
      setError(e?.toString() || "Failed to move note");
    } finally {
      setMoving(false);
    }
  };

  // Non-elysium vaults for moving to other vaults
  const availableVaults = vaults.filter((v) => !v.id.startsWith("elysium-"));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 w-full max-w-sm max-h-[70vh] flex flex-col">
        <div className="p-4 border-b border-neutral-700/50">
          <h2 className="text-sm font-semibold text-app">Move "{noteFilename}"</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {browsePath ? (
            // Browsing inside a vault/folder
            <>
              <button
                onClick={() => {
                  // Go up one level
                  const parent = browsePath.substring(0, browsePath.lastIndexOf("/"));
                  const isVaultRoot = availableVaults.some((v) => v.path === browsePath);
                  if (isVaultRoot) {
                    setBrowsePath(null);
                  } else {
                    setBrowsePath(parent);
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-app-muted hover:bg-neutral-700/50 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>

              {/* Move here button */}
              <button
                onClick={() => handleMove(browsePath)}
                disabled={moving || browsePath === noteDir}
                style={browsePath !== noteDir ? { backgroundColor: "var(--accent)" } : undefined}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer mt-1 mb-1 ${
                  browsePath === noteDir
                    ? "text-app-faint bg-neutral-700/30 cursor-not-allowed"
                    : "text-white"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                {moving ? "Moving..." : browsePath === noteDir ? "Current location" : "Move here"}
              </button>

              {/* Subfolders */}
              {folders.map((folder) => (
                <button
                  key={folder.absolutePath}
                  onClick={() => setBrowsePath(folder.absolutePath)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-app hover:bg-neutral-700/50 cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-app-muted shrink-0">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="truncate flex-1 text-left">{folder.name}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-app-faint shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
              {folders.length === 0 && (
                <p className="text-app-faint text-xs text-center py-2">No subfolders</p>
              )}
            </>
          ) : (
            // Vault list
            <>
              {availableVaults.map((vault) => (
                <button
                  key={vault.id}
                  onClick={() => setBrowsePath(vault.path)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer ${
                    vault.id === activeVaultId ? "text-app bg-neutral-700/30" : "text-app hover:bg-neutral-700/50"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-app-muted shrink-0">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="truncate flex-1 text-left">{vault.name}</span>
                  {vault.id === activeVaultId && (
                    <span className="text-[10px] text-app-faint">current</span>
                  )}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-app-faint shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </>
          )}

          {error && <p className="text-xs text-red-400 mt-2 px-3">{error}</p>}
        </div>

        <div className="p-3 border-t border-neutral-700/50">
          <button
            onClick={onClose}
            className="w-full px-3 py-1.5 text-sm text-app-muted hover:text-app transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
