import { useMemo } from "react";
import { useStore } from "../stores/store";
import { useNotes } from "./useNotes";
import { sortNotes } from "../lib/sortNotes";

export function useSortedNotes() {
  const { notes, refreshNotes, loadNoteContent } = useNotes();
  const vaults = useStore((s) => s.vaults);
  const activeVaultId = useStore((s) => s.activeVaultId);

  const vault = vaults.find((v) => v.id === activeVaultId);
  const sortMode = vault?.sortMode || "alphabetical";
  const sortDescending = vault?.sortDescending ?? true;
  const noteOrder = vault?.noteOrder || [];
  const noteOverrides = vault?.noteOverrides || {};
  const noteOrderKey = JSON.stringify(noteOrder);
  const overridesKey = JSON.stringify(noteOverrides);

  const sortedNotes = useMemo(
    () => sortNotes(notes, sortMode, noteOrder, sortDescending, noteOverrides),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notes, sortMode, sortDescending, noteOrderKey, overridesKey]
  );

  return { notes: sortedNotes, refreshNotes, loadNoteContent, sortMode, sortDescending };
}
