import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { useStore } from "../../stores/store";
import { t } from "../../lib/i18n";
import type { EditMode, SortMode, ViewMode } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, path: string, viewMode: ViewMode, editMode: EditMode, sortMode: SortMode, recursive: boolean) => Promise<unknown>;
}

export function VaultAddDialog({ isOpen, onClose, onAdd }: Props) {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("accordion");
  const [editMode, setEditMode] = useState<EditMode>("markdown");
  const [sortMode, setSortMode] = useState<SortMode>("alphabetical");
  const [recursive, setRecursive] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handlePickFolder = async () => {
    const setBlurSuppressed = useStore.getState().setBlurSuppressed;
    setBlurSuppressed(true);
    try {
      const selected = await open({ directory: true, multiple: false });
      if (selected) {
        setPath(selected as string);
        if (!name) {
          const parts = (selected as string).split(/[/\\]/);
          setName(parts[parts.length - 1] || "");
        }
      }
    } catch (e) {
      console.error("Failed to pick folder:", e);
    } finally {
      setBlurSuppressed(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(t("nameRequired"));
      return;
    }
    if (!path.trim()) {
      setError(t("pathRequired"));
      return;
    }
    setError("");
    try {
      await onAdd(name.trim(), path.trim(), viewMode, editMode, sortMode, recursive);
      setName("");
      setPath("");
      setViewMode("accordion");
      setEditMode("markdown");
      setSortMode("alphabetical");
      setRecursive(false);
      onClose();
    } catch (e: any) {
      setError(e?.toString() || t("failedToAdd"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 w-full max-w-sm p-5">
        <h2 className="text-base font-semibold text-app mb-4">{t("addVault")}</h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-app-muted block mb-1">{t("name")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5
                         text-sm text-app focus:outline-none focus:border-neutral-500"
              placeholder="My Notes"
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
                placeholder="/path/to/vault"
              />
              <button
                onClick={handlePickFolder}
                className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-sm
                           text-app transition-colors cursor-pointer"
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
            style={{ backgroundColor: "var(--accent)" }}
            className="px-4 py-1.5 rounded text-sm
                       text-white transition-colors cursor-pointer"
          >
            {t("addVault")}
          </button>
        </div>
      </div>
    </div>
  );
}
