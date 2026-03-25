import { useStore } from "../../stores/store";
import { updateNoteOverride } from "../../lib/tauri";
import type { ViewMode } from "../../types";

interface Props {
  noteRelativePath: string;
  compact?: boolean;
}

export function ViewModeSelector({ noteRelativePath, compact }: Props) {
  const getActiveVault = useStore((s) => s.getActiveVault);
  const getEffectiveViewMode = useStore((s) => s.getEffectiveViewMode);

  const vault = getActiveVault();
  if (!vault) return null;

  const currentMode = getEffectiveViewMode(noteRelativePath);
  const hasOverride = vault.noteOverrides[noteRelativePath]?.viewMode != null;

  const handleChange = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const modes: ViewMode[] = ["accordion", "full", "always-open"];
    const currentIdx = modes.indexOf(currentMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];

    try {
      await updateNoteOverride(vault.id, noteRelativePath, {
        viewMode: nextMode,
      });
      // Reload config to reflect changes
      const { loadConfig } = await import("../../lib/tauri");
      const config = await loadConfig();
      useStore.getState().setVaults(config.vaults);
    } catch (e) {
      console.error("Failed to update note override:", e);
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
      className={`text-[10px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
        hasOverride
          ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
          : "bg-slate-700/40 text-slate-500 hover:text-slate-400"
      }`}
      title={`${tooltips[currentMode]}${hasOverride ? " (override)" : ""} - click to cycle`}
    >
      {labels[currentMode]}
    </button>
  );
}
