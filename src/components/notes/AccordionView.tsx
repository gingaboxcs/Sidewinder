import { useStore } from "../../stores/store";
import { useNotes } from "../../hooks/useNotes";
import { NoteContent } from "./NoteContent";
import { ViewModeSelector } from "../common/ViewModeSelector";

export function AccordionView() {
  const { notes, loadNoteContent } = useNotes();
  const expandedNotes = useStore((s) => s.expandedNotes);
  const toggleNote = useStore((s) => s.toggleNote);
  const loadedContent = useStore((s) => s.loadedContent);

  const handleToggle = async (absolutePath: string) => {
    toggleNote(absolutePath);
    if (!expandedNotes.has(absolutePath) && !loadedContent[absolutePath]) {
      await loadNoteContent(absolutePath);
    }
  };

  return (
    <div className="p-3 space-y-1">
      {notes.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">
          No notes in this vault
        </p>
      ) : (
        notes.map((note) => {
          const isExpanded = expandedNotes.has(note.absolutePath);
          const content = loadedContent[note.absolutePath];

          return (
            <div
              key={note.absolutePath}
              className="rounded-lg border border-slate-700/50 overflow-hidden"
            >
              <button
                onClick={() => handleToggle(note.absolutePath)}
                className="w-full flex items-center justify-between px-3 py-2.5
                           bg-slate-800/40 hover:bg-slate-800/80 transition-colors
                           text-left cursor-pointer"
              >
                <span className="text-sm font-medium text-slate-200 truncate">
                  {note.filename}
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <ViewModeSelector
                    noteRelativePath={note.relativePath}
                    compact
                  />
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`text-slate-500 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>
              {isExpanded && (
                <div className="px-3 py-3 bg-slate-900/50 border-t border-slate-700/30">
                  {content ? (
                    <NoteContent content={content} />
                  ) : (
                    <p className="text-slate-500 text-xs">Loading...</p>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
