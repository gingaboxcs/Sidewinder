import { useEffect, useState } from "react";
import { useStore } from "../../stores/store";
import { useNotes } from "../../hooks/useNotes";
import { deleteNote } from "../../lib/tauri";
import { NoteContent } from "./NoteContent";
import { ViewModeSelector } from "../common/ViewModeSelector";
import { EditModeSelector } from "../common/EditModeSelector";
import { ConfirmDialog } from "../common/ConfirmDialog";

export function FullNoteView() {
  const activeNoteId = useStore((s) => s.activeNoteId);
  const loadedContent = useStore((s) => s.loadedContent);
  const notes = useStore((s) => s.notes);
  const vaults = useStore((s) => s.vaults);
  const activeVaultId = useStore((s) => s.activeVaultId);
  const goBack = useStore((s) => s.goBack);
  const { loadNoteContent } = useNotes();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const vault = vaults.find((v) => v.id === activeVaultId);
  const note = notes.find((n) => n.absolutePath === activeNoteId);
  const content = activeNoteId ? loadedContent[activeNoteId] : undefined;

  const noteEditMode = note
    ? (vault?.noteOverrides[note.relativePath]?.editMode || vault?.editMode || "markdown")
    : "markdown";

  const displayTitle = note?.filename || "Untitled";

  useEffect(() => {
    if (activeNoteId && content == null) {
      loadNoteContent(activeNoteId);
    }
  }, [activeNoteId, content, loadNoteContent]);

  if (!note) {
    return (
      <div className="p-4 text-app-faint text-sm text-center">
        Note not found
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-app">
          {displayTitle}
        </h2>
        <div className="flex items-center gap-1 shrink-0">
          <ViewModeSelector noteRelativePath={note.relativePath} compact />
          <EditModeSelector noteRelativePath={note.relativePath} />
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1 cursor-pointer text-app-faint hover:text-red-400 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6"/><path d="M5 6h14l-1 14H6z"/>
            </svg>
          </button>
        </div>
      </div>
      {content != null ? (
        <NoteContent content={content} absolutePath={note.absolutePath} editMode={noteEditMode} />
      ) : (
        <p className="text-app-faint text-xs">Loading...</p>
      )}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        message={`Delete "${displayTitle}"?`}
        onConfirm={async () => {
          await deleteNote(note.absolutePath);
          setShowDeleteConfirm(false);
          goBack();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
