import { useStore } from "../../stores/store";
import type { Vault } from "../../types";

interface Props {
  vault: Vault;
  onRemove: (id: string) => void;
}

const viewModeLabels: Record<string, string> = {
  accordion: "Accordion",
  full: "Full Note",
  "always-open": "Always Open",
};

export function VaultCard({ vault, onRemove }: Props) {
  const setActiveVault = useStore((s) => s.setActiveVault);

  return (
    <div
      onClick={() => setActiveVault(vault.id)}
      className="group p-4 rounded-lg bg-slate-800/60 hover:bg-slate-800
                 border border-slate-700/50 hover:border-slate-600/50
                 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-200 truncate">
            {vault.name}
          </h3>
          <p className="text-xs text-slate-500 truncate mt-1" title={vault.path}>
            {vault.path}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(vault.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400
                     transition-all p-1 cursor-pointer"
          title="Remove vault"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400">
          {viewModeLabels[vault.viewMode] || vault.viewMode}
        </span>
        {vault.recursive && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400">
            Recursive
          </span>
        )}
      </div>
    </div>
  );
}
