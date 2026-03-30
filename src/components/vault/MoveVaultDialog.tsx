import { useState, useEffect } from "react";
import { useStore } from "../../stores/store";
import { moveFolder, listFolderContents, removeVault, loadConfig } from "../../lib/tauri";
import type { FolderEntry, Vault } from "../../types";

interface Props {
  vault: Vault | null;
  onClose: () => void;
}

export function MoveVaultDialog({ vault, onClose }: Props) {
  const vaults = useStore((s) => s.vaults);
  const setVaults = useStore((s) => s.setVaults);

  const [browsePath, setBrowsePath] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [error, setError] = useState("");
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (!browsePath) {
      setFolders([]);
      return;
    }
    listFolderContents(browsePath).then(([folderList]) => {
      setFolders(folderList);
    }).catch(console.error);
  }, [browsePath]);

  if (!vault) return null;

  const availableVaults = vaults.filter((v) =>
    !v.id.startsWith("elysium-") && v.id !== vault.id
  );

  const handleMoveInto = async (destDir: string) => {
    setError("");
    setMoving(true);
    try {
      // Physically move the folder
      await moveFolder(vault.path, destDir);

      // Remove the vault entry since it's now a subfolder
      await removeVault(vault.id);

      // Refresh
      const config = await loadConfig();
      setVaults(config.vaults);

      onClose();
    } catch (e: any) {
      setError(e?.toString() || "Failed to move vault");
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 w-full max-w-sm max-h-[70vh] flex flex-col">
        <div className="p-4 border-b border-neutral-700/50">
          <h2 className="text-sm font-semibold text-app">Move "{vault.name}"</h2>
          <p className="text-[10px] text-app-faint mt-1">
            Move this vault into another vault as a subfolder
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {browsePath ? (
            <>
              <button
                onClick={() => {
                  const isVaultRoot = availableVaults.some((v) => v.path === browsePath);
                  if (isVaultRoot) {
                    setBrowsePath(null);
                  } else {
                    const parent = browsePath.substring(0, browsePath.lastIndexOf("/"));
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

              <button
                onClick={() => handleMoveInto(browsePath)}
                disabled={moving}
                style={{ backgroundColor: "var(--accent)" }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-white cursor-pointer mt-1 mb-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                {moving ? "Moving..." : "Move here as subfolder"}
              </button>

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
            <>
              <p className="text-xs text-app-muted px-3 py-2">Select a vault to move into:</p>
              {availableVaults.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setBrowsePath(v.path)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-app hover:bg-neutral-700/50 cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-app-muted shrink-0">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="truncate flex-1 text-left">{v.name}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-app-faint shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
              {availableVaults.length === 0 && (
                <p className="text-app-faint text-xs text-center py-4">No other vaults to move into</p>
              )}
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
