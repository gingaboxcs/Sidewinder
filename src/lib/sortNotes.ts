import type { NoteMeta, NoteOverride, SortMode } from "../types";

/** Natural sort comparison — respects numbers (e.g. "item2" before "item10") */
function naturalCompare(a: string, b: string): number {
  const ax: (string | number)[] = [];
  const bx: (string | number)[] = [];

  a.replace(/(\d+)|(\D+)/g, (_, n, s) => {
    ax.push(n ? parseInt(n) : s);
    return "";
  });
  b.replace(/(\d+)|(\D+)/g, (_, n, s) => {
    bx.push(n ? parseInt(n) : s);
    return "";
  });

  for (let i = 0; i < Math.max(ax.length, bx.length); i++) {
    const ai = ax[i] ?? "";
    const bi = bx[i] ?? "";

    if (typeof ai === "number" && typeof bi === "number") {
      if (ai !== bi) return ai - bi;
    } else {
      const sa = String(ai).toLowerCase();
      const sb = String(bi).toLowerCase();
      if (sa !== sb) return sa < sb ? -1 : 1;
    }
  }
  return 0;
}

export function sortNotes(
  notes: NoteMeta[],
  sortMode: SortMode,
  noteOrder: string[],
  descending: boolean = true,
  noteOverrides?: Record<string, NoteOverride>,
): NoteMeta[] {
  const sorted = [...notes];
  const dir = descending ? -1 : 1;

  switch (sortMode) {
    case "alphabetical":
      sorted.sort((a, b) => dir * naturalCompare(a.filename, b.filename));
      break;
    case "modified":
      sorted.sort((a, b) => dir * (a.modifiedAt - b.modifiedAt));
      break;
    case "manual": {
      const orderMap = new Map(noteOrder.map((path, i) => [path, i]));
      sorted.sort((a, b) => {
        const ai = orderMap.get(a.relativePath);
        const bi = orderMap.get(b.relativePath);
        if (ai == null && bi == null) return naturalCompare(a.filename, b.filename);
        if (ai == null) return 1;
        if (bi == null) return -1;
        return ai - bi;
      });
      break;
    }
  }

  // Pinned notes always go to the top, preserving their relative sort order
  if (noteOverrides) {
    const pinned: NoteMeta[] = [];
    const unpinned: NoteMeta[] = [];
    for (const note of sorted) {
      if (noteOverrides[note.relativePath]?.pinned) {
        pinned.push(note);
      } else {
        unpinned.push(note);
      }
    }
    return [...pinned, ...unpinned];
  }

  return sorted;
}
