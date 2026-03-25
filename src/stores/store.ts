import { create } from "zustand";
import type { NoteMeta, Vault, ViewMode } from "../types";

type View = "vault-list" | "note-list" | "note-full";

interface AppState {
  // Vault state
  vaults: Vault[];
  activeVaultId: string | null;

  // Notes state
  notes: NoteMeta[];
  loadedContent: Record<string, string>;
  expandedNotes: Set<string>;
  activeNoteId: string | null;

  // UI state
  view: View;
  isSlid: boolean;

  // Actions
  setVaults: (vaults: Vault[]) => void;
  setActiveVault: (id: string) => void;
  setNotes: (notes: NoteMeta[]) => void;
  setNoteContent: (path: string, content: string) => void;
  toggleNote: (path: string) => void;
  openNoteFull: (path: string) => void;
  goBack: () => void;
  toggleSlide: () => void;
  setSlid: (slid: boolean) => void;
  setView: (view: View) => void;
  getActiveVault: () => Vault | undefined;
  getEffectiveViewMode: (relativePath: string) => ViewMode;
  reset: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  vaults: [],
  activeVaultId: null,
  notes: [],
  loadedContent: {},
  expandedNotes: new Set(),
  activeNoteId: null,
  view: "vault-list",
  isSlid: false,

  setVaults: (vaults) => set({ vaults }),

  setActiveVault: (id) =>
    set({
      activeVaultId: id,
      view: "note-list",
      notes: [],
      loadedContent: {},
      expandedNotes: new Set(),
      activeNoteId: null,
    }),

  setNotes: (notes) => set({ notes }),

  setNoteContent: (path, content) =>
    set((state) => ({
      loadedContent: { ...state.loadedContent, [path]: content },
    })),

  toggleNote: (path) =>
    set((state) => {
      const next = new Set(state.expandedNotes);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return { expandedNotes: next };
    }),

  openNoteFull: (path) =>
    set({ activeNoteId: path, view: "note-full" }),

  goBack: () => {
    const state = get();
    if (state.view === "note-full") {
      set({ view: "note-list", activeNoteId: null });
    } else if (state.view === "note-list") {
      set({
        view: "vault-list",
        activeVaultId: null,
        notes: [],
        loadedContent: {},
        expandedNotes: new Set(),
      });
    }
  },

  toggleSlide: () => set((state) => ({ isSlid: !state.isSlid })),
  setSlid: (slid) => set({ isSlid: slid }),
  setView: (view) => set({ view }),

  getActiveVault: () => {
    const state = get();
    return state.vaults.find((v) => v.id === state.activeVaultId);
  },

  getEffectiveViewMode: (relativePath) => {
    const vault = get().getActiveVault();
    if (!vault) return "accordion";
    const override = vault.noteOverrides[relativePath];
    if (override?.viewMode) return override.viewMode;
    return vault.viewMode;
  },

  reset: () =>
    set({
      activeVaultId: null,
      notes: [],
      loadedContent: {},
      expandedNotes: new Set(),
      activeNoteId: null,
      view: "vault-list",
    }),
}));
