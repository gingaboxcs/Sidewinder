import { useState, useRef, useCallback, useEffect } from "react";
import { useStore } from "../../stores/store";
import { useSortedNotes } from "../../hooks/useSortedNotes";
import { updateVault, deleteNote, deleteFolder, readNotesBatch, renameNote, createNote, saveNote, listFolderContents } from "../../lib/tauri";
import { NoteContent, parseCopyContent, combineCopyContent } from "./NoteContent";
import { readNote } from "../../lib/tauri";
import { ViewModeSelector } from "../common/ViewModeSelector";
import { EditModeSelector } from "../common/EditModeSelector";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { MoveNoteDialog } from "./MoveNoteDialog";
import type { EditMode, FolderEntry, ViewMode } from "../../types";
import { t } from "../../lib/i18n";

function QuickCopyButton({ absolutePath }: { absolutePath: string }) {
  const [copied, setCopied] = useState(false);
  const loadedContent = useStore((s) => s.loadedContent);
  const setNoteContent = useStore((s) => s.setNoteContent);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      let content = loadedContent[absolutePath];
      if (content == null) {
        content = await readNote(absolutePath);
        setNoteContent(absolutePath, content);
      }
      const { copy } = parseCopyContent(content);
      if (copy) {
        await navigator.clipboard.writeText(copy);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-0.5 cursor-pointer transition-colors ${copied ? "text-green-400" : "text-app-faint hover:text-app-muted"}`}
      title={copied ? t("copied") : t("copyToClipboard")}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  );
}

export function AccordionView() {
  const { notes: allNotes, loadNoteContent, sortMode, refreshNotes } = useSortedNotes();
  const expandedNotes = useStore((s) => s.expandedNotes);
  const toggleNote = useStore((s) => s.toggleNote);
  const loadedContent = useStore((s) => s.loadedContent);
  const vaults = useStore((s) => s.vaults);
  const activeVaultId = useStore((s) => s.activeVaultId);
  const setVaults = useStore((s) => s.setVaults);
  const setNoteContent = useStore((s) => s.setNoteContent);
  const openNoteFull = useStore((s) => s.openNoteFull);
  const currentFolderPath = useStore((s) => s.currentFolderPath);
  const setCurrentFolderPath = useStore((s) => s.setCurrentFolderPath);

  // Folder contents for browsing mode
  const [folders, setFolders] = useState<FolderEntry[]>([]);

  const vault = vaults.find((v) => v.id === activeVaultId);
  const activePath = currentFolderPath || vault?.path || "";

  // Get effective settings for current folder (folder override > vault default)
  const folderRelPath = currentFolderPath && vault
    ? currentFolderPath.replace(vault.path, "").replace(/^\//, "")
    : "";
  const folderOverride = folderRelPath && vault?.folderOverrides
    ? vault.folderOverrides[folderRelPath]
    : undefined;

  const effectiveSortMode = folderOverride?.sortMode || sortMode;
  const effectiveSortDescending = folderOverride?.sortDescending ?? (vault?.sortDescending ?? true);
  const effectiveEditMode = folderOverride?.editMode || vault?.editMode || "markdown";
  const effectiveViewMode = (folderOverride?.viewMode || vault?.viewMode || "accordion") as ViewMode;

  // Load folder contents when path changes, sorted by effective settings
  useEffect(() => {
    if (!activePath) return;
    listFolderContents(activePath).then(([folderList]) => {
      const sorted = [...folderList];
      const dir = effectiveSortDescending ? -1 : 1;
      switch (effectiveSortMode) {
        case "alphabetical":
          sorted.sort((a, b) => dir * a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
          break;
        case "modified":
          sorted.sort((a, b) => dir * (a.modifiedAt - b.modifiedAt));
          break;
        // manual: keep original order
      }
      setFolders(sorted);
    }).catch(console.error);
  }, [activePath, allNotes, effectiveSortMode, effectiveSortDescending]);

  // Filter notes to only show ones in the current folder (not subfolders)
  const filteredNotes = allNotes.filter((n) => {
    const noteDir = n.absolutePath.substring(0, n.absolutePath.lastIndexOf("/"));
    return noteDir === activePath;
  });

  const isManual = effectiveSortMode === "manual";

  const getNoteViewMode = (relativePath: string): ViewMode => {
    const override = vault?.noteOverrides[relativePath];
    return override?.viewMode || effectiveViewMode;
  };

  const getNoteEditMode = (relativePath: string): EditMode => {
    const override = vault?.noteOverrides[relativePath];
    return override?.editMode || effectiveEditMode;
  };

  // Load content for always-open notes only (not all notes — that causes loops)
  useEffect(() => {
    if (!filteredNotes.length || !vault) return;
    const alwaysOpenPaths = filteredNotes
      .filter((n) => getNoteViewMode(n.relativePath) === "always-open" && loadedContent[n.absolutePath] == null)
      .map((n) => n.absolutePath);
    if (!alwaysOpenPaths.length) return;
    readNotesBatch(alwaysOpenPaths).then((results) => {
      for (const [path, content] of Object.entries(results)) {
        setNoteContent(path, content);
      }
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredNotes]);

  // Folder drag state
  const [folderDragFrom, setFolderDragFrom] = useState<number | null>(null);
  const [folderDragOver, setFolderDragOver] = useState<number | null>(null);
  const folderEls = useRef<(HTMLDivElement | null)[]>([]);
  const folderOverRef = useRef<number | null>(null);

  // Note drag state
  const [dragFromIdx, setDragFromIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const itemEls = useRef<(HTMLDivElement | null)[]>([]);
  const currentOverRef = useRef<number | null>(null);

  const [deletingNote, setDeletingNote] = useState<{ path: string; name: string } | null>(null);
  const [movingNote, setMovingNote] = useState<{ path: string; name: string; isFolder?: boolean } | null>(null);
  const saveFolderSettings = async (folderAbsPath: string, updates: Record<string, unknown>) => {
    if (!vault) return;
    const relPath = folderAbsPath.replace(vault.path, "").replace(/^\//, "");
    if (!relPath) return;
    const existing = vault.folderOverrides?.[relPath] || {};
    const updated = {
      ...vault,
      folderOverrides: {
        ...vault.folderOverrides,
        [relPath]: { ...existing, ...updates },
      },
    };
    setVaults(vaults.map((v) => v.id === vault.id ? updated : v));
    try {
      await updateVault(updated);
    } catch (e) { console.error(e); }
  };
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState("");

  const notes = filteredNotes;

  // Inline note creation state
  const creatingNote = useStore((s) => s.creatingNote);
  const setCreatingNote = useStore((s) => s.setCreatingNote);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteCopyContent, setNewNoteCopyContent] = useState("");
  const [newNoteError, setNewNoteError] = useState("");
  const newNoteTitleRef = useRef<HTMLInputElement>(null);

  // Edit mode for the new note (defaults to vault/folder default, user can override)
  const [newNoteMode, setNewNoteMode] = useState<EditMode>(effectiveEditMode as EditMode);
  const isCopyMode = newNoteMode === "copy";

  // Focus title input when creation form appears
  useEffect(() => {
    if (creatingNote) {
      setNewNoteTitle("");
      setNewNoteContent("");
      setNewNoteCopyContent("");
      setNewNoteError("");
      setNewNoteMode(effectiveEditMode as EditMode);
      requestAnimationFrame(() => newNoteTitleRef.current?.focus());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatingNote]);

  const handleCreateNoteDone = async () => {
    const title = newNoteTitle.trim() || t("untitled");
    try {
      let name = title;
      let counter = 1;
      let fullPath: string | null = null;
      while (!fullPath) {
        try {
          fullPath = await createNote(activePath, name);
        } catch {
          counter++;
          name = `${title} ${counter}`;
        }
      }
      const finalContent = isCopyMode
        ? combineCopyContent(newNoteCopyContent, newNoteContent)
        : newNoteContent;
      if (finalContent.trim()) {
        await saveNote(fullPath, finalContent);
      }

      // If the selected mode differs from the vault's default, save as override
      if (vault && newNoteMode !== effectiveEditMode) {
        const relPath = fullPath.replace(vault.path, "").replace(/^\//, "");
        const existing = vault.noteOverrides[relPath] || {};
        const updatedVault = {
          ...vault,
          noteOverrides: {
            ...vault.noteOverrides,
            [relPath]: { ...existing, editMode: newNoteMode },
          },
        };
        setVaults(vaults.map((v) => v.id === vault.id ? updatedVault : v));
        updateVault(updatedVault).catch(console.error);
      }

      setCreatingNote(false);
      await refreshNotes();
      // Expand the new note
      toggleNote(fullPath);
      setNoteContent(fullPath, finalContent);
    } catch (e: any) {
      setNewNoteError(e?.toString() || "Failed to create note");
    }
  };

  const handleCreateNoteCancel = () => {
    setCreatingNote(false);
    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteCopyContent("");
    setNewNoteError("");
  };

  const handleToggle = async (absolutePath: string) => {
    toggleNote(absolutePath);
    if (!expandedNotes.has(absolutePath) && !loadedContent[absolutePath]) {
      await loadNoteContent(absolutePath);
    }
  };

  const commitReorder = useCallback((fromIdx: number, toIdx: number) => {
    if (!vault || fromIdx === toIdx || toIdx < 0 || toIdx >= notes.length) return;

    const reordered = [...notes];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const newOrder = reordered.map((n) => n.relativePath);

    const updatedVault = { ...vault, noteOrder: newOrder };
    setVaults(vaults.map((v) => v.id === vault.id ? updatedVault : v));
    updateVault(updatedVault).catch(console.error);
  }, [vault, notes, vaults, setVaults]);

  // Folder reorder
  const commitFolderReorder = useCallback((fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || toIdx < 0 || toIdx >= folders.length) return;
    const reordered = [...folders];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setFolders(reordered);
    // We don't persist folder order to the vault config for now — it's session-based
    // Could be added later with a folderOrder field
  }, [folders]);

  const findClosestFolderIdx = (clientY: number): number => {
    let closest = 0;
    let closestDist = Infinity;
    folderEls.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(clientY - center);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    return closest;
  };

  const handleFolderGripDown = (e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setFolderDragFrom(idx);
    setFolderDragOver(idx);
    folderOverRef.current = idx;

    const startIdx = idx;
    const onMove = (me: PointerEvent) => {
      const over = findClosestFolderIdx(me.clientY);
      folderOverRef.current = over;
      setFolderDragOver(over);
    };
    const onUp = () => {
      const finalOver = folderOverRef.current;
      if (finalOver != null && finalOver !== startIdx) {
        commitFolderReorder(startIdx, finalOver);
      }
      setFolderDragFrom(null);
      setFolderDragOver(null);
      folderOverRef.current = null;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  const findClosestIdx = (clientY: number): number => {
    let closest = 0;
    let closestDist = Infinity;
    itemEls.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(clientY - center);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  };

  const handleGripDown = (e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();

    const startIdx = idx;
    setDragFromIdx(idx);
    setDragOverIdx(idx);
    currentOverRef.current = idx;

    const onMove = (me: PointerEvent) => {
      const over = findClosestIdx(me.clientY);
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

  const submitRename = async () => {
    if (!renamingPath || !renameValue.trim()) {
      setRenamingPath(null);
      return;
    }
    const note = notes.find((n) => n.absolutePath === renamingPath);
    if (note && renameValue.trim() === note.filename) {
      setRenamingPath(null);
      return;
    }
    setRenameError("");
    try {
      const newPath = await renameNote(renamingPath, renameValue.trim());
      setRenamingPath(null);
      await refreshNotes();
      if (newPath) {
        const expanded = useStore.getState().expandedNotes;
        if (!expanded.has(newPath)) {
          toggleNote(newPath);
        }
      }
    } catch (e: any) {
      setRenameError(e?.toString() || "Failed to rename");
    }
  };

  return (
    <div className="p-3 space-y-1">
      {/* Inline note creation form */}
      {creatingNote && (
        <div className="rounded-lg border border-neutral-700/50 overflow-hidden mb-1">
          <div className="px-3 py-2.5 bg-neutral-800/70 flex items-center gap-2">
            <input
              ref={newNoteTitleRef}
              value={newNoteTitle}
              onChange={(e) => { setNewNoteTitle(e.target.value); setNewNoteError(""); }}
              onKeyDown={(e) => {
                if (e.key === "Escape") handleCreateNoteCancel();
              }}
              placeholder={t("noteTitle")}
              className="flex-1 min-w-0 bg-black/30 border border-neutral-600 rounded px-2 py-0.5
                         text-sm text-app focus:outline-none focus:border-neutral-500"
            />
            <select
              value={newNoteMode}
              onChange={(e) => setNewNoteMode(e.target.value as EditMode)}
              className="shrink-0 bg-black/30 border border-neutral-600 rounded px-1.5 py-0.5
                         text-xs text-app-muted focus:outline-none focus:border-neutral-500 cursor-pointer"
              title={t("edit")}
            >
              <option value="markdown">{t("markdown")}</option>
              <option value="code">{t("code")}</option>
              <option value="plaintext">{t("plainText")}</option>
              <option value="copy">{t("copyNote")}</option>
            </select>
          </div>
          <div className="px-3 py-3 bg-neutral-900/50 border-t border-neutral-700/30">
            {isCopyMode && (
              <>
                <label className="text-[10px] text-app-muted block mb-1">{t("copyContent")}</label>
                <textarea
                  value={newNoteCopyContent}
                  onChange={(e) => setNewNoteCopyContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") handleCreateNoteCancel();
                  }}
                  placeholder={t("copyContentPlaceholder")}
                  className="w-full bg-black/20 border border-neutral-700 rounded px-3 py-2 mb-3
                             text-app focus:outline-none focus:border-neutral-500 resize-none text-sm leading-relaxed
                             font-mono"
                  rows={4}
                  spellCheck={false}
                />
                <label className="text-[10px] text-app-muted block mb-1">{t("notes")}</label>
              </>
            )}
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") handleCreateNoteCancel();
              }}
              placeholder={isCopyMode ? t("notesPlaceholder") : t("notes") + "..."}
              className="w-full bg-black/20 border border-neutral-700 rounded px-3 py-2
                         text-app focus:outline-none focus:border-neutral-500 resize-none text-sm leading-relaxed min-h-[80px]"
              rows={isCopyMode ? 3 : 4}
            />
            {newNoteError && <p className="text-[10px] text-red-400 mt-1">{newNoteError}</p>}
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleCreateNoteCancel}
                className="text-xs px-3 py-1.5 rounded bg-neutral-700 text-app-muted hover:bg-neutral-600 hover:text-app cursor-pointer transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleCreateNoteDone}
                style={{ backgroundColor: "var(--accent)" }}
                className="text-xs px-3 py-1.5 rounded text-white cursor-pointer"
              >
                {t("done")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subfolders */}
      {folders.map((folder, fIdx) => {
        const isFolderDragging = folderDragFrom === fIdx;
        const isFolderDropTarget = folderDragOver === fIdx && folderDragFrom !== null && folderDragFrom !== fIdx;

        return (
          <div
            key={folder.absolutePath}
            ref={(el) => { folderEls.current[fIdx] = el; }}
            className={`rounded-lg border overflow-hidden ${
              isFolderDragging ? "opacity-30 border-neutral-700/50"
                : isFolderDropTarget ? "border-neutral-400"
                : "border-neutral-700/50"
            }`}
          >
            {isFolderDropTarget && (
              <div style={{ height: 3, backgroundColor: "var(--accent)", marginTop: -1 }} />
            )}
            <div
              onClick={() => setCurrentFolderPath(folder.absolutePath)}
              className="flex items-center px-3 py-2.5 bg-neutral-800/70 hover:bg-neutral-800/90 cursor-pointer transition-colors"
            >
              {isManual && (
                <div
                  onPointerDown={(e) => handleFolderGripDown(e, fIdx)}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 mr-2 cursor-grab active:cursor-grabbing text-app-faint hover:text-app-muted
                             touch-none select-none p-1 -ml-1 rounded hover:bg-neutral-700/50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="4" y1="6" x2="20" y2="6"/>
                    <line x1="4" y1="12" x2="20" y2="12"/>
                    <line x1="4" y1="18" x2="20" y2="18"/>
                  </svg>
                </div>
              )}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   className="text-app-muted shrink-0 mr-2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-sm font-medium text-app truncate flex-1">{folder.name}</span>
              <div className="flex items-center gap-1 shrink-0 ml-2">
              {(() => {
                const relPath = folder.absolutePath.replace(vault?.path || "", "").replace(/^\//, "");
                const fo = vault?.folderOverrides?.[relPath] || {};
                const fView = fo.viewMode || vault?.viewMode || "accordion";
                const fEdit = fo.editMode || vault?.editMode || "markdown";
                const hasViewOverride = !!fo.viewMode;
                const hasEditOverride = !!fo.editMode;
                const viewModes = ["accordion", "full", "always-open"];
                const editModes = ["markdown", "code", "plaintext"];
                return (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = viewModes[(viewModes.indexOf(fView) + 1) % viewModes.length];
                        saveFolderSettings(folder.absolutePath, { viewMode: next });
                      }}
                      style={hasViewOverride ? { backgroundColor: "color-mix(in srgb, var(--accent) 30%, transparent)", color: "var(--accent)" } : undefined}
                      className={`text-[10px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                        hasViewOverride ? "" : "bg-neutral-700/40 text-app-faint hover:text-app-muted"
                      }`}
                      title={`${t("view")}: ${fView}${hasViewOverride ? ` (${t("override")})` : ""}`}
                    >
                      {fView === "accordion" ? "A" : fView === "full" ? "F" : "O"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = editModes[(editModes.indexOf(fEdit) + 1) % editModes.length];
                        saveFolderSettings(folder.absolutePath, { editMode: next });
                      }}
                      style={hasEditOverride ? { backgroundColor: "color-mix(in srgb, var(--accent) 30%, transparent)", color: "var(--accent)" } : undefined}
                      className={`text-[10px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                        hasEditOverride ? "" : "bg-neutral-700/40 text-app-faint hover:text-app-muted"
                      }`}
                      title={`${t("edit")}: ${fEdit}${hasEditOverride ? ` (${t("override")})` : ""}`}
                    >
                      {fEdit === "markdown" ? "MD" : fEdit === "code" ? "</>" : "Txt"}
                    </button>
                  </>
                );
              })()}
                <span className="text-[10px] text-app-faint w-[28px] text-right">
                  {folder.itemCount}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMovingNote({ path: folder.absolutePath, name: folder.name, isFolder: true });
                  }}
                  className="p-0.5 text-app-faint hover:text-app-muted cursor-pointer transition-colors"
                  title={t("moveFolder")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingNote({ path: folder.absolutePath, name: folder.name });
                  }}
                  className="p-0.5 text-app-faint hover:text-red-400 cursor-pointer transition-colors"
                  title={t("deleteFolder")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6"/><path d="M5 6h14l-1 14H6z"/>
                  </svg>
                </button>
                <button className="p-0.5 invisible"><svg width="14" height="14" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg></button>
              </div>
            </div>
          </div>
        );
      })}

      {notes.length === 0 && folders.length === 0 ? (
        <p className="text-app-faint text-sm text-center py-8">
          {t("noNotes")}
        </p>
      ) : (
        notes.map((note, idx) => {
          const noteMode = getNoteViewMode(note.relativePath);
          const noteEditMode = getNoteEditMode(note.relativePath);
          const isExpanded = expandedNotes.has(note.absolutePath);
          const content = loadedContent[note.absolutePath];
          const isDragging = dragFromIdx === idx;
          const isDropTarget = dragOverIdx === idx && dragFromIdx !== null && dragFromIdx !== idx;
          const showContent = noteMode === "always-open" || (noteMode === "accordion" && isExpanded);

          const displayTitle = note.filename;

          return (
            <div
              key={note.relativePath}
              ref={(el) => { itemEls.current[idx] = el; }}
              className={`rounded-lg border overflow-hidden ${
                isDragging ? "opacity-30 border-neutral-700/50"
                  : isDropTarget ? "border-neutral-400"
                  : "border-neutral-700/50"
              }`}
            >
              {isDropTarget && (
                <div style={{ height: 3, backgroundColor: "var(--accent)", marginTop: -1 }} />
              )}
              <div className="flex items-center px-3 py-2.5 bg-neutral-800/70 hover:bg-neutral-800/90 transition-colors">
                {isManual && (
                  <div
                    onPointerDown={(e) => handleGripDown(e, idx)}
                    className="shrink-0 mr-2 cursor-grab active:cursor-grabbing text-app-faint hover:text-app-muted
                               touch-none select-none p-1 -ml-1 rounded hover:bg-neutral-700/50"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="4" y1="6" x2="20" y2="6"/>
                      <line x1="4" y1="12" x2="20" y2="12"/>
                      <line x1="4" y1="18" x2="20" y2="18"/>
                    </svg>
                  </div>
                )}

                {renamingPath === note.absolutePath ? (
                  <div className="flex-1 min-w-0 mr-2">
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => { setRenameValue(e.target.value); setRenameError(""); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); submitRename(); }
                        if (e.key === "Escape") { setRenamingPath(null); setRenameError(""); }
                      }}
                      onBlur={() => submitRename()}
                      placeholder={t("noteTitle")}
                      className="w-full bg-black/30 border border-neutral-600 rounded px-2 py-0.5
                                 text-sm text-app focus:outline-none focus:border-neutral-500"
                    />
                    {renameError && <p className="text-[10px] text-red-400 mt-0.5">{renameError}</p>}
                  </div>
                ) : (
                <span
                  onClick={() => handleToggle(note.absolutePath)}
                  onDoubleClick={(e) => { e.stopPropagation(); setRenamingPath(note.absolutePath); setRenameValue(note.filename); setRenameError(""); }}
                  className="text-sm font-medium text-app truncate flex-1 min-w-0 cursor-pointer"
                >
                  {displayTitle}
                </span>
                )}

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const isPinned = vault?.noteOverrides[note.relativePath]?.pinned;
                      const existing = vault?.noteOverrides[note.relativePath] || {};
                      const updated = {
                        ...vault!,
                        noteOverrides: {
                          ...vault!.noteOverrides,
                          [note.relativePath]: { ...existing, pinned: !isPinned },
                        },
                      };
                      setVaults(vaults.map((v) => v.id === vault!.id ? updated : v));
                      updateVault(updated).catch(console.error);
                    }}
                    className={`p-0.5 cursor-pointer transition-colors ${
                      vault?.noteOverrides[note.relativePath]?.pinned
                        ? "text-amber-400"
                        : "text-app-faint hover:text-app-muted"
                    }`}
                    title={vault?.noteOverrides[note.relativePath]?.pinned ? t("unpin") : t("pinToTop")}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill={vault?.noteOverrides[note.relativePath]?.pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 17v5" /><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16h14v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
                    </svg>
                  </button>
                  {noteEditMode === "copy" && (
                    <QuickCopyButton absolutePath={note.absolutePath} />
                  )}
                  <ViewModeSelector noteRelativePath={note.relativePath} compact />
                  <EditModeSelector noteRelativePath={note.relativePath} />
                  <div className="w-[28px]" />
                  <button
                    onClick={() => setMovingNote({ path: note.absolutePath, name: note.filename })}
                    className="p-0.5 cursor-pointer text-app-faint hover:text-app-muted transition-colors"
                    title={t("moveNote")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeletingNote({ path: note.absolutePath, name: note.filename })}
                    className="p-0.5 cursor-pointer text-app-faint hover:text-red-400 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6"/><path d="M5 6h14l-1 14H6z"/>
                    </svg>
                  </button>
                  {noteMode === "full" ? (
                    <button
                      onClick={() => { loadNoteContent(note.absolutePath); openNoteFull(note.absolutePath); }}
                      className="p-0.5 cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-app-faint">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  ) : noteMode === "always-open" ? (
                    <button className="p-0.5 shrink-0 invisible"><svg width="14" height="14" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg></button>
                  ) : (
                    <button
                      onClick={() => handleToggle(note.absolutePath)}
                      className="p-0.5 cursor-pointer"
                    >
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        className={`text-app-faint transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {showContent && (
                <div className="px-3 py-3 bg-neutral-900/50 border-t border-neutral-700/30">
                  {content != null ? (
                    <NoteContent
                      content={content}
                      absolutePath={note.absolutePath}
                      editMode={noteEditMode}
                      startInEditMode={false}
                    />
                  ) : (
                    <p className="text-app-faint text-xs">{t("loading")}</p>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
      <ConfirmDialog
        isOpen={deletingNote !== null}
        message={`${t("delete_")} "${deletingNote?.name}"?`}
        onConfirm={async () => {
          if (deletingNote) {
            // Check if it's a folder (folders are in the folders list)
            const isFolder = folders.some((f) => f.absolutePath === deletingNote.path);
            if (isFolder) {
              await deleteFolder(deletingNote.path);
            } else {
              await deleteNote(deletingNote.path);
            }
            refreshNotes();
          }
          setDeletingNote(null);
        }}
        onCancel={() => setDeletingNote(null)}
      />
      <MoveNoteDialog
        notePath={movingNote?.path || null}
        noteFilename={movingNote?.name || ""}
        isFolder={movingNote?.isFolder}
        onClose={() => { setMovingNote(null); refreshNotes(); }}
      />
    </div>
  );
}
