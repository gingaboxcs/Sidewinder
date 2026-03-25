import { useStore } from "../../stores/store";
import { useNotes } from "../../hooks/useNotes";
import { AccordionView } from "./AccordionView";
import { AlwaysOpenView } from "./AlwaysOpenView";

export function NoteList() {
  const getActiveVault = useStore((s) => s.getActiveVault);
  const openNoteFull = useStore((s) => s.openNoteFull);
  const { notes, loadNoteContent } = useNotes();

  const vault = getActiveVault();
  if (!vault) return null;

  const viewMode = vault.viewMode;

  if (viewMode === "always-open") {
    return <AlwaysOpenView />;
  }

  if (viewMode === "full") {
    return (
      <div className="p-3 space-y-1">
        {notes.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">
            No notes in this vault
          </p>
        ) : (
          notes.map((note) => (
            <button
              key={note.absolutePath}
              onClick={() => {
                loadNoteContent(note.absolutePath);
                openNoteFull(note.absolutePath);
              }}
              className="w-full flex items-center px-3 py-2.5
                         rounded-lg bg-slate-800/40 hover:bg-slate-800/80
                         border border-slate-700/50 transition-colors
                         text-left cursor-pointer"
            >
              <span className="text-sm font-medium text-slate-200 truncate">
                {note.filename}
              </span>
            </button>
          ))
        )}
      </div>
    );
  }

  // Default: accordion
  return <AccordionView />;
}
