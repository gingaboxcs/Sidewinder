import { useEffect, useState } from "react";
import { useStore } from "../../stores/store";
import { useSortedNotes } from "../../hooks/useSortedNotes";
import { readNotesBatch, deleteNote } from "../../lib/tauri";
import { NoteContent } from "./NoteContent";
import { ViewModeSelector } from "../common/ViewModeSelector";
import { ConfirmDialog } from "../common/ConfirmDialog";

export function AlwaysOpenView() {
  const { notes, refreshNotes } = useSortedNotes();
  const loadedContent = useStore((s) => s.loadedContent);
  const setNoteContent = useStore((s) => s.setNoteContent);
  const getActiveVault = useStore((s) => s.getActiveVault);

  const vault = getActiveVault();
  const [deletingNote, setDeletingNote] = useState<{ path: string; name: string } | null>(null);
  const editMode = vault?.editMode || "markdown";

  // Load all notes content on mount
  useEffect(() => {
    if (notes.length === 0) return;

    const unloaded = notes
      .filter((n) => !loadedContent[n.absolutePath])
      .map((n) => n.absolutePath);

    if (unloaded.length === 0) return;

    readNotesBatch(unloaded).then((results) => {
      for (const [path, content] of Object.entries(results)) {
        setNoteContent(path, content);
      }
    }).catch(console.error);
  }, [notes, loadedContent, setNoteContent]);

  return (
    <div className="p-3 space-y-3">
      {notes.length === 0 ? (
        <p className="text-app-faint text-sm text-center py-8">
          No notes in this vault
        </p>
      ) : (
        notes.map((note) => {
          const content = loadedContent[note.absolutePath];

          return (
            <div
              key={note.absolutePath}
              className="rounded-lg border border-neutral-700/50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-2.5 bg-neutral-800/40">
                <span className="text-sm font-medium text-app truncate">
                  {note.filename}
                </span>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <ViewModeSelector noteRelativePath={note.relativePath} compact />
                  <button
                    onClick={() => setDeletingNote({ path: note.absolutePath, name: note.filename })}
                    className="p-0.5 cursor-pointer text-app-faint hover:text-red-400 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6"/><path d="M5 6h14l-1 14H6z"/>
                    </svg>
                  </button>
                  <div className="p-0.5 w-[18px]" />
                </div>
              </div>
              <div className="px-3 py-3 bg-neutral-900/50 border-t border-neutral-700/30">
                {content != null ? (
                  <NoteContent
                    content={content}
                    absolutePath={note.absolutePath}
                    editMode={editMode}
                  />
                ) : (
                  <p className="text-app-faint text-xs">Loading...</p>
                )}
              </div>
            </div>
          );
        })
      )}
      <ConfirmDialog
        isOpen={deletingNote !== null}
        message={`Delete "${deletingNote?.name}"?`}
        onConfirm={async () => {
          if (deletingNote) {
            await deleteNote(deletingNote.path);
            refreshNotes();
          }
          setDeletingNote(null);
        }}
        onCancel={() => setDeletingNote(null)}
      />
    </div>
  );
}
