import { useState } from "react";
import { useVaults } from "../../hooks/useVaults";
import { VaultCard } from "./VaultCard";
import { VaultAddDialog } from "./VaultAddDialog";

export function VaultList() {
  const { vaults, addVault, removeVault } = useVaults();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Vaults
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700
                     border border-slate-700 hover:border-slate-600
                     rounded text-slate-300 transition-colors cursor-pointer"
        >
          + Add
        </button>
      </div>

      {vaults.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-sm mb-3">No vaults yet</p>
          <button
            onClick={() => setShowAdd(true)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            Add your first vault
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {vaults.map((vault) => (
            <VaultCard
              key={vault.id}
              vault={vault}
              onRemove={removeVault}
            />
          ))}
        </div>
      )}

      <VaultAddDialog
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={addVault}
      />
    </div>
  );
}
