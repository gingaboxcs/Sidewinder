import { useEffect } from "react";
import { useStore } from "../../stores/store";
import { useNotes } from "../../hooks/useNotes";
import { readNotesBatch } from "../../lib/tauri";
import { NoteContent } from "./NoteContent";
import { ViewModeSelector } from "../common/ViewModeSelector";

export function AlwaysOpenView() {
  const { notes } = useNotes();
  const loadedContent = useStore((s) => s.loadedContent);
  const setNoteContent = useStore((s) => s.setNoteContent);

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
        <p className="text-slate-500 text-sm text-center py-8">
          No notes in this vault
        </p>
      ) : (
        notes.map((note) => {
          const content = loadedContent[note.absolutePath];

          return (
            <div
              key={note.absolutePath}
              className="rounded-lg border border-slate-700/50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-2.5 bg-slate-800/40">
                <span className="text-sm font-medium text-slate-200 truncate">
                  {note.filename}
                </span>
                <ViewModeSelector
                  noteRelativePath={note.relativePath}
                  compact
                />
              </div>
              <div className="px-3 py-3 bg-slate-900/50 border-t border-slate-700/30">
                {content ? (
                  <NoteContent content={content} />
                ) : (
                  <p className="text-slate-500 text-xs">Loading...</p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
