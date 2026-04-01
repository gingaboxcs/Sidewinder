import { useState, useEffect } from "react";
import { useStore } from "../../stores/store";
import { listNotes } from "../../lib/tauri";
import { TrophyIcon } from "../elysium/ElysiumIcons";
import type { Vault } from "../../types";
import { t } from "../../lib/i18n";

interface Props {
  vault: Vault;
  onRemove: (id: string) => void;
  onEdit: (vault: Vault) => void;
  onMove?: (vault: Vault) => void;
  onClick?: () => void;
}

export function VaultCard({ vault, onRemove, onEdit, onMove, onClick }: Props) {
  const setActiveVault = useStore((s) => s.setActiveVault);
  const isElysium = vault.id.startsWith("elysium-");
  const [noteCount, setNoteCount] = useState<number | null>(null);

  useEffect(() => {
    listNotes(vault.path, true)
      .then((notes) => setNoteCount(notes.length))
      .catch(() => setNoteCount(null));
  }, [vault.path, vault.recursive]);

  return (
    <div
      onClick={onClick || (() => setActiveVault(vault.id))}
      className="group p-3 rounded-lg bg-neutral-800/80 hover:bg-neutral-800
                 border border-neutral-700/50 hover:border-neutral-600/50
                 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-app truncate flex items-center gap-1.5 min-w-0">
          {isElysium && <TrophyIcon size={14} />}
          {vault.name}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {!isElysium && (
            <>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-700/40 text-app-faint">
                {vault.viewMode === "accordion" ? "A" : vault.viewMode === "full" ? "F" : "O"}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-700/40 text-app-faint">
                {vault.editMode === "markdown" ? "MD" : vault.editMode === "code" ? "</>" : "Txt"}
              </span>
            </>
          )}
          <span className="text-[10px] text-app-faint w-[28px] text-right">
            {noteCount ?? ""}
          </span>
          {!isElysium && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(vault);
                }}
                className="text-app-faint hover:text-app p-1 cursor-pointer"
                title={t("editVault")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              {onMove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(vault);
                  }}
                  className="text-app-faint hover:text-app-muted p-1 cursor-pointer"
                  title={t("moveVault")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(vault.id);
                }}
                className="text-app-faint hover:text-red-400 p-1 cursor-pointer"
                title={t("removeVault")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6"/><path d="M5 6h14l-1 14H6z"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
