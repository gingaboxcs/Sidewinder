use crate::models::NoteMeta;
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::time::UNIX_EPOCH;

#[tauri::command]
pub fn list_notes(vault_path: String, recursive: bool) -> Result<Vec<NoteMeta>, String> {
    let base = Path::new(&vault_path);
    if !base.exists() {
        return Err(format!("Vault path does not exist: {}", vault_path));
    }

    let mut notes = Vec::new();
    collect_notes(base, base, recursive, &mut notes)?;
    notes.sort_by(|a, b| a.filename.to_lowercase().cmp(&b.filename.to_lowercase()));
    Ok(notes)
}

fn collect_notes(
    base: &Path,
    dir: &Path,
    recursive: bool,
    notes: &mut Vec<NoteMeta>,
) -> Result<(), String> {
    let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_dir() && recursive {
            collect_notes(base, &path, recursive, notes)?;
        } else if path.is_file() {
            if let Some(ext) = path.extension() {
                if ext == "md" {
                    let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
                    let modified = metadata
                        .modified()
                        .map_err(|e| e.to_string())?
                        .duration_since(UNIX_EPOCH)
                        .map_err(|e| e.to_string())?
                        .as_millis() as u64;

                    let relative = path
                        .strip_prefix(base)
                        .map_err(|e| e.to_string())?
                        .to_string_lossy()
                        .to_string();

                    let filename = path
                        .file_stem()
                        .unwrap_or_default()
                        .to_string_lossy()
                        .to_string();

                    notes.push(NoteMeta {
                        filename,
                        relative_path: relative,
                        absolute_path: path.to_string_lossy().to_string(),
                        modified_at: modified,
                        size_bytes: metadata.len(),
                    });
                }
            }
        }
    }
    Ok(())
}

#[tauri::command]
pub fn read_note(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn read_notes_batch(paths: Vec<String>) -> Result<HashMap<String, String>, String> {
    let mut results = HashMap::new();
    for path in paths {
        match fs::read_to_string(&path) {
            Ok(content) => {
                results.insert(path, content);
            }
            Err(e) => {
                results.insert(path, format!("Error reading file: {}", e));
            }
        }
    }
    Ok(results)
}
