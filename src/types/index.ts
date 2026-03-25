export type ViewMode = "accordion" | "full" | "always-open";

export interface Vault {
  id: string;
  name: string;
  path: string;
  viewMode: ViewMode;
  recursive: boolean;
  noteOverrides: Record<string, NoteOverride>;
}

export interface NoteOverride {
  viewMode?: ViewMode;
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
}

export interface WindowConfig {
  edge: "right" | "left";
  width: number;
  height: number;
}

export interface FsEvent {
  path: string;
  kind: "modified" | "removed";
}
