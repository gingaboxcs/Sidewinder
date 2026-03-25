import { useEffect } from "react";
import { useStore } from "../../stores/store";
import { useNotes } from "../../hooks/useNotes";
import { NoteContent } from "./NoteContent";

export function FullNoteView() {
  const activeNoteId = useStore((s) => s.activeNoteId);
  const loadedContent = useStore((s) => s.loadedContent);
  const notes = useStore((s) => s.notes);
  const { loadNoteContent } = useNotes();

  const note = notes.find((n) => n.absolutePath === activeNoteId);
  const content = activeNoteId ? loadedContent[activeNoteId] : undefined;

  useEffect(() => {
    if (activeNoteId && !content) {
      loadNoteContent(activeNoteId);
    }
  }, [activeNoteId, content, loadNoteContent]);

  if (!note) {
    return (
      <div className="p-4 text-slate-500 text-sm text-center">
        Note not found
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-slate-200 mb-3">
        {note.filename}
      </h2>
      {content ? (
        <NoteContent content={content} />
      ) : (
        <p className="text-slate-500 text-xs">Loading...</p>
      )}
    </div>
  );
}
