import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { useStore } from "../../stores/store";
import { t } from "../../lib/i18n";
import type { EditMode, SortMode, Vault, ViewMode } from "../../types";

interface Props {
  vault: Vault | null;
  onClose: () => void;
  onSave: (vault: Vault) => Promise<void>;
}

export function VaultEditDialog({ vault, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("accordion");
  const [editMode, setEditMode] = useState<EditMode>("markdown");
  const [sortMode, setSortMode] = useState<SortMode>("alphabetical");
  const [recursive, setRecursive] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vault) {
      setName(vault.name);
      setPath(vault.path);
      setViewMode(vault.viewMode);
      setEditMode(vault.editMode);
      setSortMode(vault.sortMode);
      setRecursive(vault.recursive);
      setError("");
    }
  }, [vault]);

  const handlePickFolder = async () => {
    useStore.getState().setBlurSuppressed(true);
    try {
      const selected = await open({ directory: true, multiple: false });
      if (selected) {
        setPath(selected as string);
      }
    } catch (e) {
      console.error("Failed to pick folder:", e);
    } finally {
      useStore.getState().setBlurSuppressed(false);
    }
  };

  if (!vault) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(t("nameRequired"));
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave({
        ...vault,
        name: name.trim(),
        path: path.trim(),
        viewMode,
        editMode,
        sortMode,
        recursive,
      });
      onClose();
    } catch (e: any) {
      setError(e?.toString() || t("failedToSave"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 w-full max-w-sm p-5">
        <h2 className="text-base font-semibold text-app mb-4">{t("editVault")}</h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-app-muted block mb-1">{t("name")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5
                         text-sm text-app focus:outline-none focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="text-xs text-app-muted block mb-1">{t("path")}</label>
            <div className="flex gap-2">
              <input
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5
                           text-sm text-app focus:outline-none focus:border-neutral-500"
              />
              <button
                onClick={handlePickFolder}
                className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-sm
                           text-app-muted transition-colors cursor-pointer"
              >
                {t("browse")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-app-muted block mb-1">{t("view")}</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5
                           text-sm text-app focus:outline-none focus:border-neutral-500"
              >
                <option value="accordion">{t("accordion")}</option>
                <option value="full">{t("full")}</option>
                <option value="always-open">{t("alwaysOpen")}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-app-muted block mb-1">{t("edit")}</label>
              <select
                value={editMode}
                onChange={(e) => setEditMode(e.target.value as EditMode)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5
                           text-sm text-app focus:outline-none focus:border-neutral-500"
              >
                <option value="markdown">{t("markdown")}</option>
                <option value="code">{t("code")}</option>
                <option value="plaintext">{t("plainText")}</option>
                <option value="copy">{t("copyNote")}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-app-muted block mb-1">{t("sort")}</label>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5
                           text-sm text-app focus:outline-none focus:border-neutral-500"
              >
                <option value="alphabetical">{t("alphabetical")}</option>
                <option value="modified">{t("recent")}</option>
                <option value="manual">{t("manual")}</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={recursive}
              onChange={(e) => setRecursive(e.target.checked)}
              className="rounded border-neutral-600"
            />
            <span className="text-sm text-app">{t("includeSubfolders")}</span>
          </label>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-app-muted hover:text-app
                       transition-colors cursor-pointer"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{ backgroundColor: "var(--accent)" }}
            className="px-4 py-1.5 rounded text-sm
                       text-white transition-colors cursor-pointer"
          >
            {saving ? t("save") + "..." : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
