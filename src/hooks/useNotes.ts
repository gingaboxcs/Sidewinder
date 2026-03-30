import { useCallback, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { listNotes, readNote, watchVault, unwatchVault } from "../lib/tauri";
import { useStore } from "../stores/store";
import type { FsEvent } from "../types";

export function useNotes() {
  const activeVaultId = useStore((s) => s.activeVaultId);
  const notes = useStore((s) => s.notes);
  const setNotes = useStore((s) => s.setNotes);
  const setNoteContent = useStore((s) => s.setNoteContent);
  const getActiveVault = useStore((s) => s.getActiveVault);

  const refreshNotes = useCallback(async () => {
    const vault = getActiveVault();
    if (!vault) return;
    try {
      // Always list recursively so subfolder navigation works
      const noteList = await listNotes(vault.path, true);
      setNotes(noteList);
    } catch (e) {
      console.error("Failed to list notes:", e);
    }
  }, [getActiveVault, setNotes]);

  const loadNoteContent = useCallback(
    async (absolutePath: string) => {
      try {
        const content = await readNote(absolutePath);
        setNoteContent(absolutePath, content);
      } catch (e) {
        console.error("Failed to read note:", e);
      }
    },
    [setNoteContent]
  );

  // Load notes and start watching when vault changes
  useEffect(() => {
    const vault = getActiveVault();
    if (!vault) return;

    refreshNotes();
    watchVault(vault.path, vault.recursive).catch(console.error);

    return () => {
      unwatchVault().catch(console.error);
    };
  }, [activeVaultId, getActiveVault, refreshNotes]);

  // Listen for file system events
  useEffect(() => {
    const unlisten = listen<FsEvent>("fs-event", (event) => {
      const { kind, path } = event.payload;
      if (kind === "removed") {
        refreshNotes();
      } else if (kind === "modified") {
        // Check if this is a new file or modification
        const exists = notes.some((n) => n.absolutePath === path);
        if (exists) {
          loadNoteContent(path);
        } else {
          refreshNotes();
        }
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [notes, refreshNotes, loadNoteContent]);

  return { notes, refreshNotes, loadNoteContent };
}
