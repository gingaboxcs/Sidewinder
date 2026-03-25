use crate::config;
use crate::models::{AppConfig, NoteOverride, Vault, ViewMode};
use std::collections::HashMap;
use uuid::Uuid;

#[tauri::command]
pub fn load_config_cmd() -> Result<AppConfig, String> {
    Ok(config::load_config())
}

#[tauri::command]
pub fn save_config_cmd(config_data: AppConfig) -> Result<(), String> {
    config::save_config(&config_data)
}

#[tauri::command]
pub fn add_vault(name: String, path: String, view_mode: ViewMode, recursive: bool) -> Result<Vault, String> {
    let path_buf = std::path::Path::new(&path);
    if !path_buf.exists() {
        return Err(format!("Directory does not exist: {}", path));
    }
    if !path_buf.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }

    let vault = Vault {
        id: Uuid::new_v4().to_string(),
        name,
        path,
        view_mode,
        recursive,
        note_overrides: HashMap::new(),
    };

    let mut app_config = config::load_config();
    app_config.vaults.push(vault.clone());
    config::save_config(&app_config)?;

    Ok(vault)
}

#[tauri::command]
pub fn remove_vault(id: String) -> Result<(), String> {
    let mut app_config = config::load_config();
    app_config.vaults.retain(|v| v.id != id);
    config::save_config(&app_config)
}

#[tauri::command]
pub fn update_vault(vault: Vault) -> Result<(), String> {
    let mut app_config = config::load_config();
    if let Some(existing) = app_config.vaults.iter_mut().find(|v| v.id == vault.id) {
        *existing = vault;
    } else {
        return Err("Vault not found".to_string());
    }
    config::save_config(&app_config)
}

#[tauri::command]
pub fn update_note_override(vault_id: String, relative_path: String, override_data: NoteOverride) -> Result<(), String> {
    let mut app_config = config::load_config();
    if let Some(vault) = app_config.vaults.iter_mut().find(|v| v.id == vault_id) {
        vault.note_overrides.insert(relative_path, override_data);
    } else {
        return Err("Vault not found".to_string());
    }
    config::save_config(&app_config)
}

#[tauri::command]
pub fn create_vault_directory(path: String) -> Result<(), String> {
    std::fs::create_dir_all(&path).map_err(|e| e.to_string())
}
