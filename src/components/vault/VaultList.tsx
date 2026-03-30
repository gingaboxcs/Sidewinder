import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useVaults } from "../../hooks/useVaults";
import { useStore } from "../../stores/store";
import { saveConfig, loadConfig, getElysiumNoteFolders, openInElysium } from "../../lib/tauri";
import { VaultCard } from "./VaultCard";
import { VaultAddDialog } from "./VaultAddDialog";
import { VaultEditDialog } from "./VaultEditDialog";
import { MoveVaultDialog } from "./MoveVaultDialog";
import { TrophyIcon } from "../elysium/ElysiumIcons";
import { useLicense } from "../../hooks/useLicense";
import { UpgradePrompt } from "../common/UpgradePrompt";
import { t } from "../../lib/i18n";
import type { ElysiumNoteFolder, SortMode, Vault } from "../../types";

const sortLabels: Record<SortMode, string> = {
  alphabetical: "A-Z",
  modified: "Recent",
  manual: "Manual",
};

export function VaultList() {
  const { vaults, addVault, removeVault, updateVault } = useVaults();
  useStore((s) => s.language); // subscribe for i18n re-render
  const elysiumConfig = useStore((s) => s.elysiumConfig);
  const vaultSortMode = useStore((s) => s.vaultSortMode);
  const vaultOrder = useStore((s) => s.vaultOrder);
  const vaultSortDescending = useStore((s) => s.vaultSortDescending);
  const setVaultSortMode = useStore((s) => s.setVaultSortMode);
  const setVaultSortDescending = useStore((s) => s.setVaultSortDescending);
  const setVaultOrder = useStore((s) => s.setVaultOrder);

  const [showAdd, setShowAdd] = useState(false);
  const [editingVault, setEditingVault] = useState<Vault | null>(null);
  const [movingVault, setMovingVault] = useState<Vault | null>(null);
  const { isPro, vaultLimit, FREE_VAULT_LIMIT } = useLicense();
  const regularVaultCount = vaults.filter((v) => !v.id.startsWith("elysium-")).length;
  const atLimit = !isPro && regularVaultCount >= vaultLimit;

  // Get Elysium folders for integrated mode
  const elysiumFolders = useElysiumFolders();
  const isIntegrated = elysiumConfig.displayMode === "integrated"
    && elysiumConfig.enabled && elysiumConfig.autoImportNotes;

  // Convert Elysium folders to vault-like entries for integrated mode
  const elysiumAsVaults: Vault[] = useMemo(() => {
    if (!isIntegrated) return [];
    return elysiumFolders.map((f) => ({
      id: `elysium-${f.name}`,
      name: f.name,
      path: f.path,
      viewMode: "accordion" as const,
      editMode: "markdown" as const,
      sortMode: "modified" as const,
      sortDescending: true,
      recursive: false,
      noteOverrides: {},
      noteOrder: [],
      folderOverrides: {},
    }));
  }, [isIntegrated, elysiumFolders]);

  const isManual = vaultSortMode === "manual";

  // Sort vaults (merge Elysium vaults in integrated mode)
  const sortedVaults = useMemo(() => {
    const sorted = [...vaults, ...elysiumAsVaults];
    const dir = vaultSortDescending ? -1 : 1;
    switch (vaultSortMode) {
      case "alphabetical":
        sorted.sort((a, b) => dir * a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
        break;
      case "modified":
        // Reverse the list for descending (newest first)
        if (vaultSortDescending) sorted.reverse();
        break;
      case "manual": {
        const orderMap = new Map(vaultOrder.map((id, i) => [id, i]));
        sorted.sort((a, b) => {
          const ai = orderMap.get(a.id);
          const bi = orderMap.get(b.id);
          if (ai == null && bi == null) return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
          if (ai == null) return 1;
          if (bi == null) return -1;
          return ai - bi;
        });
        break;
      }
    }
    return sorted;
  }, [vaults, elysiumAsVaults, vaultSortMode, vaultSortDescending, vaultOrder]);

  // Drag state
  const [dragFromIdx, setDragFromIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const itemEls = useRef<(HTMLDivElement | null)[]>([]);
  const currentOverRef = useRef<number | null>(null);

  const commitReorder = useCallback(async (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || toIdx < 0 || toIdx >= sortedVaults.length) return;

    const reordered = [...sortedVaults];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const newOrder = reordered.map((v) => v.id);

    setVaultOrder(newOrder);

    try {
      const config = await loadConfig();
      config.vaultOrder = newOrder;
      await saveConfig(config);
    } catch (e) {
      console.error("Failed to save vault order:", e);
    }
  }, [sortedVaults, setVaultOrder]);

  const handleGripDown = (e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();

    const startIdx = idx;
    setDragFromIdx(idx);
    setDragOverIdx(idx);
    currentOverRef.current = idx;

    const findClosest = (clientY: number) => {
      let closest = 0;
      let closestDist = Infinity;
      itemEls.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(clientY - center);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      return closest;
    };

    const onMove = (me: PointerEvent) => {
      const over = findClosest(me.clientY);
      currentOverRef.current = over;
      setDragOverIdx(over);
    };

    const onUp = () => {
      const finalOver = currentOverRef.current;
      if (finalOver != null && finalOver !== startIdx) {
        commitReorder(startIdx, finalOver);
      }
      setDragFromIdx(null);
      setDragOverIdx(null);
      currentOverRef.current = null;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  const cycleSortMode = async () => {
    const modes: SortMode[] = ["alphabetical", "modified", "manual"];
    const idx = modes.indexOf(vaultSortMode);
    const next = modes[(idx + 1) % modes.length];
    setVaultSortMode(next);

    try {
      const config = await loadConfig();
      config.vaultSortMode = next;
      await saveConfig(config);
    } catch (e) {
      console.error("Failed to save vault sort mode:", e);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-app-muted uppercase tracking-wider">
            {t("vaults")}
          </h2>
          <button
            onClick={cycleSortMode}
            className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-app-faint
                       hover:text-app hover:bg-neutral-700 transition-colors cursor-pointer"
            title={`Sort: ${sortLabels[vaultSortMode]} (click to cycle)`}
          >
            {sortLabels[vaultSortMode]}
          </button>
          {vaultSortMode !== "manual" && (
            <button
              onClick={async () => {
                const next = !vaultSortDescending;
                setVaultSortDescending(next);
                try {
                  const config = await loadConfig();
                  config.vaultSortDescending = next;
                  await saveConfig(config);
                } catch (e) { console.error(e); }
              }}
              className="text-app-faint hover:text-app cursor-pointer p-0.5 transition-colors"
              title={vaultSortDescending ? "Newest first" : "Oldest first"}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   className={`transition-transform ${vaultSortDescending ? "" : "rotate-180"}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        </div>
        {atLimit ? (
          <UpgradePrompt feature="more vaults" compact />
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="text-xs px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700
                       border border-neutral-700 hover:border-neutral-600
                       rounded text-app transition-colors cursor-pointer"
          >
            + Add
          </button>
        )}
      </div>

      {!isPro && regularVaultCount > 0 && (
        <p className="text-[10px] text-app-faint mb-3">
          {regularVaultCount}/{FREE_VAULT_LIMIT} vaults used
        </p>
      )}

      {sortedVaults.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-app-faint text-sm mb-3">No vaults yet</p>
          <button
            onClick={() => setShowAdd(true)}
            style={{ color: "var(--accent)" }}
            className="text-sm transition-colors cursor-pointer"
          >
            Add your first vault
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedVaults.map((vault, idx) => {
            const isDragging = dragFromIdx === idx;
            const isDropTarget = dragOverIdx === idx && dragFromIdx !== null && dragFromIdx !== idx;

            return (
              <div
                key={vault.id}
                ref={(el) => { itemEls.current[idx] = el; }}
                className={`${isDragging ? "opacity-30" : ""}`}
              >
                {isDropTarget && (
                  <div style={{ height: 3, backgroundColor: "var(--accent)", marginBottom: 4, borderRadius: 2 }} />
                )}
                <div className="flex items-center gap-2">
                  {isManual && (
                    <div
                      onPointerDown={(e) => handleGripDown(e, idx)}
                      className="shrink-0 cursor-grab active:cursor-grabbing text-app-faint hover:text-app-muted
                                 touch-none select-none p-1 rounded hover:bg-neutral-700/50"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="4" y1="6" x2="20" y2="6"/>
                        <line x1="4" y1="12" x2="20" y2="12"/>
                        <line x1="4" y1="18" x2="20" y2="18"/>
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <VaultCard
                      vault={vault}
                      onRemove={vault.id.startsWith("elysium-") ? () => {} : removeVault}
                      onEdit={vault.id.startsWith("elysium-") ? () => {} : setEditingVault}
                      onMove={vault.id.startsWith("elysium-") ? undefined : setMovingVault}
                      onClick={vault.id.startsWith("elysium-") ? () => {
                        // Inject Elysium vault into store if not already there
                        const storeVaults = useStore.getState().vaults;
                        if (!storeVaults.find((v) => v.id === vault.id)) {
                          useStore.getState().setVaults([...storeVaults, vault]);
                        }
                        useStore.getState().setActiveVault(vault.id);
                      } : undefined}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ElysiumVaults />

      <VaultAddDialog
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={addVault}
      />

      <VaultEditDialog
        vault={editingVault}
        onClose={() => setEditingVault(null)}
        onSave={updateVault}
      />

      <MoveVaultDialog
        vault={movingVault}
        onClose={() => { setMovingVault(null); }}
      />
    </div>
  );
}

function useElysiumFolders() {
  const elysiumConfig = useStore((s) => s.elysiumConfig);
  const [folders, setFolders] = useState<ElysiumNoteFolder[]>([]);

  const refreshFolders = useCallback(() => {
    if (elysiumConfig.enabled && elysiumConfig.autoImportNotes && elysiumConfig.opentimePath) {
      getElysiumNoteFolders(elysiumConfig.opentimePath)
        .then(setFolders)
        .catch(console.error);
    } else {
      setFolders([]);
    }
  }, [elysiumConfig.enabled, elysiumConfig.autoImportNotes, elysiumConfig.opentimePath]);

  useEffect(() => { refreshFolders(); }, [refreshFolders]);

  useEffect(() => {
    const unlisten = listen("elysium-notes-changed", () => refreshFolders());
    return () => { unlisten.then((fn) => fn()); };
  }, [refreshFolders]);

  return folders;
}

function useOpenElysiumFolder() {
  const setActiveVault = useStore((s) => s.setActiveVault);
  const setVaults = useStore((s) => s.setVaults);
  const vaults = useStore((s) => s.vaults);

  return useCallback((folder: ElysiumNoteFolder) => {
    const existing = vaults.find((v) => v.path === folder.path);
    if (existing) {
      setActiveVault(existing.id);
      return;
    }
    const newVault: Vault = {
      id: `elysium-${folder.name}`,
      name: folder.name,
      path: folder.path,
      viewMode: "accordion",
      editMode: "markdown",
      sortMode: "modified",
      sortDescending: true,
      recursive: false,
      noteOverrides: {},
      noteOrder: [],
      folderOverrides: {},
    };
    setVaults([...vaults, newVault]);
    setActiveVault(newVault.id);
  }, [vaults, setVaults, setActiveVault]);
}

function ElysiumVaults() {
  const elysiumConfig = useStore((s) => s.elysiumConfig);
  const folders = useElysiumFolders();
  const openFolder = useOpenElysiumFolder();

  // In integrated mode, folders are injected into the main vault list — don't render a separate section
  if (elysiumConfig.displayMode === "integrated") return null;
  if (!elysiumConfig.enabled || !elysiumConfig.autoImportNotes || folders.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-app-muted uppercase tracking-wider">
          Elysium Notes
        </h2>
        <button
          onClick={() => openInElysium("", "")}
          className="text-[10px] text-app-faint hover:text-app cursor-pointer"
          title="Open Elysium"
        >
          Open App
        </button>
      </div>
      <div className="space-y-2">
        {folders.map((folder) => (
          <ElysiumFolderCard key={folder.path} folder={folder} onClick={() => openFolder(folder)} />
        ))}
      </div>
    </div>
  );
}

function ElysiumFolderCard({ folder, onClick }: { folder: ElysiumNoteFolder; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group p-3 rounded-lg bg-neutral-800/60 hover:bg-neutral-800
                 border border-neutral-700/50 hover:border-neutral-600/50
                 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-app truncate flex items-center gap-1.5">
          <TrophyIcon size={14} />
          {folder.name}
        </h3>
        <span className="text-[10px] text-app-faint">
          {folder.noteCount} note{folder.noteCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

