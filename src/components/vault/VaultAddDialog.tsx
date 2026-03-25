import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import type { ViewMode } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, path: string, viewMode: ViewMode, recursive: boolean) => Promise<unknown>;
}

export function VaultAddDialog({ isOpen, onClose, onAdd }: Props) {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("accordion");
  const [recursive, setRecursive] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handlePickFolder = async () => {
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
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!path.trim()) {
      setError("Path is required");
      return;
    }
    setError("");
    try {
      await onAdd(name.trim(), path.trim(), viewMode, recursive);
      setName("");
      setPath("");
      setViewMode("accordion");
      setRecursive(false);
      onClose();
    } catch (e: any) {
      setError(e?.toString() || "Failed to add vault");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-sm p-5">
        <h2 className="text-base font-semibold text-slate-200 mb-4">Add Vault</h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5
                         text-sm text-slate-200 focus:outline-none focus:border-slate-500"
              placeholder="My Notes"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Path</label>
            <div className="flex gap-2">
              <input
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1.5
                           text-sm text-slate-200 focus:outline-none focus:border-slate-500"
                placeholder="/path/to/vault"
              />
              <button
                onClick={handlePickFolder}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm
                           text-slate-300 transition-colors cursor-pointer"
              >
                Browse
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">View Mode</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5
                         text-sm text-slate-200 focus:outline-none focus:border-slate-500"
            >
              <option value="accordion">Accordion</option>
              <option value="full">Full Note</option>
              <option value="always-open">Always Open</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={recursive}
              onChange={(e) => setRecursive(e.target.checked)}
              className="rounded border-slate-600"
            />
            <span className="text-sm text-slate-300">Include subfolders</span>
          </label>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200
                       transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm
                       text-white transition-colors cursor-pointer"
          >
            Add Vault
          </button>
        </div>
      </div>
    </div>
  );
}
