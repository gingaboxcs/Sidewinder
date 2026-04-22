import { useStore } from "../../stores/store";
import { updateNoteOverride, loadConfig } from "../../lib/tauri";
import { t } from "../../lib/i18n";
import type { EditMode } from "../../types";

interface Props {
  noteRelativePath: string;
}

export function EditModeSelector({ noteRelativePath }: Props) {
  const vaults = useStore((s) => s.vaults);
  const activeVaultId = useStore((s) => s.activeVaultId);
  const setVaults = useStore((s) => s.setVaults);

  const vault = vaults.find((v) => v.id === activeVaultId);
  if (!vault) return null;

  const override = vault.noteOverrides[noteRelativePath];
  const currentMode = override?.editMode || vault.editMode;
  const hasOverride = override?.editMode != null;

  const handleChange = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const modes: EditMode[] = ["markdown", "code", "plaintext", "copy"];
    const currentIdx = modes.indexOf(currentMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];

    // Optimistic update
    const existingOverride = vault.noteOverrides[noteRelativePath] || {};
    const updatedVault = {
      ...vault,
      noteOverrides: {
        ...vault.noteOverrides,
        [noteRelativePath]: { ...existingOverride, editMode: nextMode },
      },
    };
    setVaults(vaults.map((v) => v.id === vault.id ? updatedVault : v));

    try {
      await updateNoteOverride(vault.id, noteRelativePath, {
        ...existingOverride,
        editMode: nextMode,
      });
    } catch (e) {
      console.error("Failed to update note edit mode:", e);
      const config = await loadConfig();
      setVaults(config.vaults);
    }
  };

  const labels: Record<EditMode, string> = {
    markdown: "MD",
    code: "</>",
    plaintext: "Txt",
    copy: "CP",
  };

  const tooltips: Record<EditMode, string> = {
    markdown: t("markdown"),
    code: t("code"),
    plaintext: t("plainText"),
    copy: t("copyNote"),
  };

  return (
    <button
      onClick={handleChange}
      style={hasOverride ? { backgroundColor: "color-mix(in srgb, var(--accent) 30%, transparent)", color: "var(--accent)" } : undefined}
      className={`text-[10px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
        hasOverride
          ? ""
          : "bg-neutral-700/40 text-app-faint hover:text-app-muted"
      }`}
      title={`${tooltips[currentMode]}${hasOverride ? ` (${t("override")})` : ""} - ${t("clickToCycle")}`}
    >
      {labels[currentMode]}
    </button>
  );
}
