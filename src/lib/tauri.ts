import { invoke } from "@tauri-apps/api/core";
import type { AppConfig, EditMode, FolderEntry, NoteMeta, NoteOverride, SearchResult, SortMode, Vault, ViewMode } from "../types";

export async function slideWindow(visible: boolean): Promise<void> {
  return invoke("slide_window", { visible });
}

export async function positionWindow(): Promise<void> {
  return invoke("position_window");
}

export async function repositionWindow(): Promise<void> {
  return invoke("reposition_window");
}

export async function quitApp(): Promise<void> {
  return invoke("quit_app");
}

export async function followMonitor(): Promise<void> {
  return invoke("follow_monitor");
}

export async function loadConfig(): Promise<AppConfig> {
  return invoke("load_config_cmd");
}

export async function saveConfig(configData: AppConfig): Promise<void> {
  return invoke("save_config_cmd", { configData });
}

export async function addVault(
  name: string,
  path: string,
  viewMode: ViewMode,
  editMode: EditMode,
  sortMode: SortMode,
  recursive: boolean
): Promise<Vault> {
  return invoke("add_vault", { name, path, viewMode, editMode, sortMode, recursive });
}

export async function removeVault(id: string): Promise<void> {
  return invoke("remove_vault", { id });
}

export async function updateVault(vault: Vault): Promise<void> {
  return invoke("update_vault", { vault });
}

export async function updateNoteOverride(
  vaultId: string,
  relativePath: string,
  overrideData: NoteOverride
): Promise<void> {
  return invoke("update_note_override", { vaultId, relativePath, overrideData });
}

export async function createVaultDirectory(path: string): Promise<void> {
  return invoke("create_vault_directory", { path });
}

export async function listNotes(
  vaultPath: string,
  recursive: boolean
): Promise<NoteMeta[]> {
  return invoke("list_notes", { vaultPath, recursive });
}

export async function searchNotes(vaults: [string, string, string][]): Promise<SearchResult[]> {
  // This is called with query separately — see the component
  return invoke("search_notes", { vaults, query: "" });
}

export async function searchNotesWithQuery(vaults: [string, string, string][], query: string): Promise<SearchResult[]> {
  return invoke("search_notes", { vaults, query });
}

export async function listFolderContents(dirPath: string): Promise<[FolderEntry[], NoteMeta[]]> {
  return invoke("list_folder_contents", { dirPath });
}

export async function moveFolder(oldPath: string, destinationDir: string): Promise<string> {
  return invoke("move_folder", { oldPath, destinationDir });
}

export async function moveNote(oldPath: string, destinationDir: string): Promise<string> {
  return invoke("move_note", { oldPath, destinationDir });
}

export async function deleteFolder(path: string): Promise<void> {
  return invoke("delete_folder", { path });
}

export async function createFolder(parentPath: string, name: string): Promise<string> {
  return invoke("create_folder", { parentPath, name });
}

export async function readNote(path: string): Promise<string> {
  return invoke("read_note", { path });
}

export async function saveNote(path: string, content: string): Promise<void> {
  return invoke("save_note", { path, content });
}

export async function createNote(vaultPath: string, filename: string): Promise<string> {
  return invoke("create_note", { vaultPath, filename });
}

export async function renameNote(oldPath: string, newName: string): Promise<string> {
  return invoke("rename_note", { oldPath, newName });
}

export async function deleteNote(path: string): Promise<void> {
  return invoke("delete_note", { path });
}

export async function readNotesBatch(
  paths: string[]
): Promise<Record<string, string>> {
  return invoke("read_notes_batch", { paths });
}

export async function watchVault(
  vaultPath: string,
  recursive: boolean
): Promise<void> {
  return invoke("watch_vault", { vaultPath, recursive });
}

export async function unwatchVault(): Promise<void> {
  return invoke("unwatch_vault");
}

export async function watchElysium(opentimePath: string): Promise<void> {
  return invoke("watch_elysium", { opentimePath });
}

export async function unwatchElysium(): Promise<void> {
  return invoke("unwatch_elysium");
}

// ─── Elysium Integration ──────────────────────────────────────────────────────

import type { ElysiumItem, ElysiumNote, ElysiumNoteFolder, ElysiumUserProfile } from "../types";

export async function loadElysiumItems(opentimePath: string): Promise<ElysiumItem[]> {
  return invoke("load_elysium_items", { opentimePath });
}

export async function loadElysiumNotes(opentimePath: string, goalTitle: string): Promise<ElysiumNote[]> {
  return invoke("load_elysium_notes", { opentimePath, goalTitle });
}

export async function loadAllElysiumNotes(opentimePath: string): Promise<Record<string, ElysiumNote[]>> {
  return invoke("load_all_elysium_notes", { opentimePath });
}

export async function openInElysium(itemType: string, itemId: string): Promise<void> {
  return invoke("open_in_elysium", { itemType, itemId });
}

export async function getElysiumUserProfile(): Promise<ElysiumUserProfile> {
  return invoke("get_elysium_user_profile");
}

export async function createElysiumNote(
  opentimePath: string,
  goalTitle: string,
  content: string,
  author: string,
  authorEmail: string,
): Promise<ElysiumNote> {
  return invoke("create_elysium_note", { opentimePath, goalTitle, content, author, authorEmail });
}

export async function getElysiumNoteFolders(opentimePath: string): Promise<ElysiumNoteFolder[]> {
  return invoke("get_elysium_note_folders", { opentimePath });
}
