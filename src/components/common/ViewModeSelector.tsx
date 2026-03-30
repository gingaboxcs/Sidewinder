import { useStore } from "../../stores/store";
import { updateNoteOverride, loadConfig } from "../../lib/tauri";
import type { ViewMode } from "../../types";

interface Props {
  noteRelativePath: string;
  compact?: boolean;
}

export function ViewModeSelector({ noteRelativePath, compact }: Props) {
  // Subscribe to vaults array so we re-render when overrides change
  const vaults = useStore((s) => s.vaults);
  const activeVaultId = useStore((s) => s.activeVaultId);
  const setVaults = useStore((s) => s.setVaults);

  const vault = vaults.find((v) => v.id === activeVaultId);
  if (!vault) return null;

  const override = vault.noteOverrides[noteRelativePath];
  const currentMode = override?.viewMode || vault.viewMode;
  const hasOverride = override?.viewMode != null;

  const handleChange = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const modes: ViewMode[] = ["accordion", "full", "always-open"];
    const currentIdx = modes.indexOf(currentMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];

    // Optimistic update — merge with existing override to preserve editMode
    const existingOverride = vault.noteOverrides[noteRelativePath] || {};
    const mergedOverride = { ...existingOverride, viewMode: nextMode };
    const updatedVault = {
      ...vault,
      noteOverrides: {
        ...vault.noteOverrides,
        [noteRelativePath]: mergedOverride,
      },
    };
    setVaults(vaults.map((v) => v.id === vault.id ? updatedVault : v));

    // Persist
    try {
      await updateNoteOverride(vault.id, noteRelativePath, mergedOverride);
    } catch (e) {
      console.error("Failed to update note override:", e);
      // Revert on error
      const config = await loadConfig();
      setVaults(config.vaults);
    }
  };

  const labels: Record<string, string> = {
    accordion: "A",
    full: "F",
    "always-open": "O",
  };

  const tooltips: Record<string, string> = {
    accordion: "Accordion mode",
    full: "Full note mode",
    "always-open": "Always open mode",
  };

  if (!compact) return null;

  return (
    <button
      onClick={handleChange}
      style={hasOverride ? { backgroundColor: "color-mix(in srgb, var(--accent) 30%, transparent)", color: "var(--accent)" } : undefined}
      className={`text-[10px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
        hasOverride
          ? ""
          : "bg-neutral-700/40 text-app-faint hover:text-app-muted"
      }`}
      title={`${tooltips[currentMode]}${hasOverride ? " (override)" : ""} - click to cycle`}
    >
      {labels[currentMode]}
    </button>
  );
}
