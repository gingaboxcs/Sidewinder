import { invoke } from "@tauri-apps/api/core";
import type { AppConfig, NoteMeta, NoteOverride, Vault, ViewMode } from "../types";

export async function slideWindow(visible: boolean): Promise<void> {
  return invoke("slide_window", { visible });
}

export async function positionWindow(): Promise<void> {
  return invoke("position_window");
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
  recursive: boolean
): Promise<Vault> {
  return invoke("add_vault", { name, path, viewMode, recursive });
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

export async function readNote(path: string): Promise<string> {
  return invoke("read_note", { path });
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
