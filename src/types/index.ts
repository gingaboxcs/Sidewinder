export type ViewMode = "accordion" | "full" | "always-open";
export type EditMode = "markdown" | "code" | "plaintext";
export type SortMode = "alphabetical" | "modified" | "manual";
export type InsertPosition = "top" | "bottom";
export type Edge = "right" | "left" | "top" | "bottom";
export type Alignment = "start" | "center" | "end";

export interface Vault {
  id: string;
  name: string;
  path: string;
  viewMode: ViewMode;
  editMode: EditMode;
  sortMode: SortMode;
  sortDescending: boolean;
  recursive: boolean;
  noteOverrides: Record<string, NoteOverride>;
  noteOrder: string[];
  folderOverrides: Record<string, FolderOverride>;
}

export interface NoteOverride {
  viewMode?: ViewMode;
  editMode?: EditMode;
  pinned?: boolean;
}

export interface FolderOverride {
  editMode?: EditMode;
  sortMode?: SortMode;
  sortDescending?: boolean;
  viewMode?: ViewMode;
  noteOrder?: string[];
  folderOrder?: string[];
}

export interface NoteMeta {
  filename: string;
  relativePath: string;
  absolutePath: string;
  modifiedAt: number;
  sizeBytes: number;
}

export interface AppConfig {
  vaults: Vault[];
  window: WindowConfig;
  vaultSortMode: SortMode;
  vaultSortDescending: boolean;
  vaultOrder: string[];
  elysium: ElysiumConfig;
  license: LicenseConfig;
  shortcuts: ShortcutsConfig;
  onboardingComplete: boolean;
  language: string;
}

export interface ShortcutsConfig {
  togglePanel: string;
  newNote: string;
  newFolder: string;
  goBack: string;
  openSettings: string;
  openCalendar: string;
  quitApp: string;
}

export interface LicenseConfig {
  status: "free" | "paid" | "elysium";
  licenseKey: string;
}

export interface WindowConfig {
  edge: Edge;
  alignment: Alignment;
  /** How far the handle protrudes from the edge, in px */
  handleThickness: number;
  /** How long the handle spans along the edge, in px */
  handleLength: number;
  /** Panel width as percentage of screen width (1-100) */
  panelWidthPct: number;
  /** Panel height as percentage of screen height (1-100) */
  panelHeightPct: number;
  /** Handle color as CSS color */
  handleColor: string;
  /** Panel background color as CSS color */
  panelColor: string;
  /** Accent color for buttons, links, active states */
  accentColor: string;
  /** Whether to close the panel when the window loses focus */
  closeOnBlur: boolean;
  /** Animation duration in ms (0 = instant) */
  animationDuration: number;
  /** Delay before animation starts in ms */
  animationDelay: number;
  defaultEditMode: EditMode;
  defaultNotePosition: InsertPosition;
  defaultVaultPosition: InsertPosition;
  theme: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  textColor: string;
  monitorMode: "primary" | "follow";
}

export interface ElysiumConfig {
  enabled: boolean;
  opentimePath: string;
  autoImportNotes: boolean;
  hiddenTypes: string[];
  displayMode: "separate" | "integrated";
  authorNameOverride: string;
  authorEmailOverride: string;
}

export interface ElysiumItem {
  id: string;
  title: string;
  type: string;
  tags: string[];
  notes?: string;
  links: { kind: string; value: string }[];
  // Goal / Project
  targetDate?: string;
  progress?: number;
  projectId?: string;
  goalId?: string;
  kind?: string;
  children: string[];
  // Task
  status?: string;
  due?: string;
  scheduledStart?: string;
  estimateMinutes?: number;
  actualMinutes?: number;
  priority?: number;
  // Event / Appointment
  start?: string;
  end?: string;
  allDay?: boolean;
  timezone?: string;
  location?: string;
  recurrence?: string;
  attendees: string[];
  provider?: string;
  // Reminder
  time?: string;
  repeat?: string;
  link?: string;
  // Habit
  pattern?: { freq?: string; daysOfWeek: string[] };
  window?: { startTime?: string; endTime?: string };
  streak?: { current?: number; longest?: number };
}

export interface ElysiumNote {
  id: string;
  goalId: string;
  goalTitle: string;
  author: string;
  authorEmail: string;
  authorProfilePicture: string;
  createdAt: string;
  content: string;
  filename: string;
  absolutePath: string;
}

export interface ElysiumUserProfile {
  displayName: string;
  email: string;
  profilePictureUrl: string;
  subscriptionTier: string;
  subscriptionStatus: string;
}

export interface ElysiumNoteFolder {
  name: string;
  path: string;
  noteCount: number;
}

export interface SearchResult {
  vaultName: string;
  vaultId: string;
  note: NoteMeta;
  matchedLine: string;
}

export interface FolderEntry {
  name: string;
  absolutePath: string;
  itemCount: number;
  modifiedAt: number;
}

export interface FsEvent {
  path: string;
  kind: "modified" | "removed";
}
