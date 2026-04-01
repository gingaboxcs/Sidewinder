import { create } from "zustand";
import type { ElysiumConfig, LicenseConfig, NoteMeta, ShortcutsConfig, SortMode, Vault, ViewMode, WindowConfig } from "../types";

type View = "vault-list" | "note-list" | "note-full" | "settings" | "calendar" | "search";

const defaultWindowConfig: WindowConfig = {
  edge: "right",
  alignment: "center",
  handleThickness: 20,
  handleLength: 80,
  panelWidthPct: 25,
  panelHeightPct: 75,
  handleColor: "#444444",
  panelColor: "#232323",
  accentColor: "#606060",
  closeOnBlur: false,
  animationDuration: 200,
  animationDelay: 0,
  defaultEditMode: "markdown",
  defaultNotePosition: "bottom",
  defaultVaultPosition: "bottom",
  theme: "dark",
  fontFamily: "System",
  fontSize: 14,
  lineHeight: 160,
  paragraphSpacing: 8,
  textColor: "#ebebeb",
  monitorMode: "primary",
  vibrancy: true,
};

interface AppState {
  // Vault state
  vaults: Vault[];
  activeVaultId: string | null;

  // Notes state
  notes: NoteMeta[];
  loadedContent: Record<string, string>;
  expandedNotes: Set<string>;
  activeNoteId: string | null;
  newlyCreatedNotePath: string | null;
  creatingNote: boolean;
  currentFolderPath: string | null;

  // UI state
  view: View;
  isSlid: boolean;
  windowConfig: WindowConfig;
  blurSuppressed: boolean;
  vaultSortMode: SortMode;
  vaultSortDescending: boolean;
  vaultOrder: string[];
  elysiumConfig: ElysiumConfig;
  licenseConfig: LicenseConfig;
  shortcutsConfig: ShortcutsConfig;
  language: string;

  // Actions
  setVaults: (vaults: Vault[]) => void;
  setVaultSortMode: (mode: SortMode) => void;
  setVaultSortDescending: (desc: boolean) => void;
  setVaultOrder: (order: string[]) => void;
  setElysiumConfig: (config: ElysiumConfig) => void;
  setLicenseConfig: (config: LicenseConfig) => void;
  setShortcutsConfig: (config: ShortcutsConfig) => void;
  setLanguage: (lang: string) => void;
  isPro: () => boolean;
  setActiveVault: (id: string) => void;
  setNotes: (notes: NoteMeta[]) => void;
  setNoteContent: (path: string, content: string) => void;
  toggleNote: (path: string) => void;
  setNewlyCreatedNotePath: (path: string | null) => void;
  setCreatingNote: (creating: boolean) => void;
  setCurrentFolderPath: (path: string | null) => void;
  openNoteFull: (path: string) => void;
  goBack: () => void;
  toggleSlide: () => void;
  setSlid: (slid: boolean) => void;
  setView: (view: View) => void;
  setWindowConfig: (config: WindowConfig) => void;
  setBlurSuppressed: (suppressed: boolean) => void;
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
  newlyCreatedNotePath: null,
  creatingNote: false,
  currentFolderPath: null,
  view: "vault-list",
  isSlid: false,
  windowConfig: defaultWindowConfig,
  blurSuppressed: false,
  vaultSortMode: "alphabetical",
  vaultSortDescending: true,
  vaultOrder: [],
  elysiumConfig: { enabled: false, opentimePath: "", autoImportNotes: false, hiddenTypes: [], displayMode: "separate", authorNameOverride: "", authorEmailOverride: "" },
  licenseConfig: { status: "free", licenseKey: "" },
  language: "en",
  shortcutsConfig: {
    togglePanel: "CommandOrControl+Alt+X",
    newNote: "CommandOrControl+N",
    newFolder: "CommandOrControl+Alt+D",
    goBack: "CommandOrControl+Backspace",
    openSettings: "CommandOrControl+,",
    openCalendar: "CommandOrControl+Alt+C",
    quitApp: "CommandOrControl+Q",
  },

  setVaults: (vaults) => set({ vaults }),
  setVaultSortMode: (mode) => set({ vaultSortMode: mode }),
  setVaultSortDescending: (desc) => set({ vaultSortDescending: desc }),
  setVaultOrder: (order) => set({ vaultOrder: order }),
  setElysiumConfig: (config) => set({ elysiumConfig: config }),
  setLicenseConfig: (config) => set({ licenseConfig: config }),
  setShortcutsConfig: (config) => set({ shortcutsConfig: config }),
  setLanguage: (lang) => set({ language: lang }),
  isPro: () => {
    const state = get();
    return state.licenseConfig.status === "paid" || state.licenseConfig.status === "elysium";
  },

  setActiveVault: (id) =>
    set({
      activeVaultId: id,
      view: "note-list",
      notes: [],
      loadedContent: {},
      expandedNotes: new Set(),
      activeNoteId: null,
      currentFolderPath: null,
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

  setNewlyCreatedNotePath: (path) => set({ newlyCreatedNotePath: path }),
  setCreatingNote: (creating) => set({ creatingNote: creating }),
  setCurrentFolderPath: (path) => set({ currentFolderPath: path }),

  openNoteFull: (path) =>
    set({ activeNoteId: path, view: "note-full" }),

  goBack: () => {
    const state = get();
    if (state.view === "note-full") {
      set({ view: "note-list", activeNoteId: null });
    } else if (state.view === "note-list" || state.view === "settings" || state.view === "calendar" || state.view === "search") {
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
  setWindowConfig: (config) => set({ windowConfig: config }),
  setBlurSuppressed: (suppressed) => set({ blurSuppressed: suppressed }),

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
