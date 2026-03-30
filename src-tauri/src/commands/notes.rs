use crate::models::NoteMeta;
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::time::UNIX_EPOCH;

#[tauri::command]
pub fn save_note(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_note(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err("Note does not exist".to_string());
    }
    fs::remove_file(p).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn rename_note(old_path: String, new_name: String) -> Result<String, String> {
    let old = Path::new(&old_path);
    if !old.exists() {
        return Err("Note does not exist".to_string());
    }
    let name = if new_name.ends_with(".md") {
        new_name
    } else {
        format!("{}.md", new_name)
    };
    let new_path = old.parent().unwrap_or(Path::new(".")).join(&name);
    if new_path.exists() && new_path != old {
        return Err(format!("A note named '{}' already exists", name));
    }
    fs::rename(old, &new_path).map_err(|e| e.to_string())?;
    Ok(new_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn create_note(vault_path: String, filename: String) -> Result<String, String> {
    let name = if filename.ends_with(".md") {
        filename
    } else {
        format!("{}.md", filename)
    };
    let full_path = Path::new(&vault_path).join(&name);
    if full_path.exists() {
        return Err(format!("A note named '{}' already exists", name));
    }
    fs::write(&full_path, "").map_err(|e| e.to_string())?;
    Ok(full_path.to_string_lossy().to_string())
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderEntry {
    pub name: String,
    pub absolute_path: String,
    pub item_count: usize,
    pub modified_at: u64,
}

/// List subfolders and notes in a specific directory (not recursive)
#[tauri::command]
pub fn list_folder_contents(dir_path: String) -> Result<(Vec<FolderEntry>, Vec<NoteMeta>), String> {
    let dir = Path::new(&dir_path);
    if !dir.exists() {
        return Err(format!("Directory does not exist: {}", dir_path));
    }

    let mut folders = Vec::new();
    let mut notes = Vec::new();

    let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_dir() {
            let name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
            // Skip hidden folders
            if name.starts_with('.') { continue; }
            // Count items inside
            let item_count = fs::read_dir(&path)
                .map(|e| e.filter(|e| e.as_ref().ok().map_or(false, |e| {
                    let p = e.path();
                    p.is_dir() || p.extension().map_or(false, |ext| ext == "md")
                })).count())
                .unwrap_or(0);
            let modified_at = fs::metadata(&path)
                .and_then(|m| m.modified())
                .map(|t| t.duration_since(UNIX_EPOCH).unwrap_or_default().as_millis() as u64)
                .unwrap_or(0);
            folders.push(FolderEntry {
                name,
                absolute_path: path.to_string_lossy().to_string(),
                item_count,
                modified_at,
            });
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

                    let filename = extract_frontmatter_title(&path)
                        .unwrap_or_else(|| {
                            path.file_stem()
                                .unwrap_or_default()
                                .to_string_lossy()
                                .to_string()
                        });

                    let relative = path.file_name().unwrap_or_default().to_string_lossy().to_string();

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

    Ok((folders, notes))
}

#[tauri::command]
pub fn delete_folder(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err("Folder does not exist".to_string());
    }
    if !p.is_dir() {
        return Err("Path is not a folder".to_string());
    }
    fs::remove_dir_all(p).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn move_folder(old_path: String, destination_dir: String) -> Result<String, String> {
    let old = Path::new(&old_path);
    if !old.exists() || !old.is_dir() {
        return Err("Folder does not exist".to_string());
    }
    let folder_name = old.file_name().ok_or("Invalid folder path")?;
    let dest_dir = Path::new(&destination_dir);
    if !dest_dir.exists() {
        return Err("Destination does not exist".to_string());
    }
    let new_path = dest_dir.join(folder_name);
    if new_path.exists() {
        return Err(format!("A folder named '{}' already exists in the destination", folder_name.to_string_lossy()));
    }
    // Use rename for same-filesystem moves, fall back to copy+delete for cross-filesystem
    if fs::rename(old, &new_path).is_err() {
        copy_dir_recursive(old, &new_path)?;
        fs::remove_dir_all(old).map_err(|e| e.to_string())?;
    }
    Ok(new_path.to_string_lossy().to_string())
}

fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<(), String> {
    fs::create_dir_all(dst).map_err(|e| e.to_string())?;
    for entry in fs::read_dir(src).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());
        if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn create_folder(parent_path: String, name: String) -> Result<String, String> {
    let folder_path = Path::new(&parent_path).join(&name);
    if folder_path.exists() {
        return Err(format!("Folder '{}' already exists", name));
    }
    fs::create_dir_all(&folder_path).map_err(|e| e.to_string())?;
    Ok(folder_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn move_note(old_path: String, destination_dir: String) -> Result<String, String> {
    let old = Path::new(&old_path);
    if !old.exists() {
        return Err("Note does not exist".to_string());
    }
    let filename = old.file_name().ok_or("Invalid file path")?;
    let dest_dir = Path::new(&destination_dir);
    if !dest_dir.exists() {
        return Err("Destination folder does not exist".to_string());
    }
    let new_path = dest_dir.join(filename);
    if new_path.exists() {
        return Err(format!("A note named '{}' already exists in the destination", filename.to_string_lossy()));
    }
    fs::rename(old, &new_path).map_err(|e| e.to_string())?;
    Ok(new_path.to_string_lossy().to_string())
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchResult {
    pub vault_name: String,
    pub vault_id: String,
    pub note: NoteMeta,
    pub matched_line: String,
}

#[tauri::command]
pub fn search_notes(vaults: Vec<(String, String, String)>, query: String) -> Result<Vec<SearchResult>, String> {
    // vaults is Vec<(id, name, path)>
    let query_lower = query.to_lowercase();
    let mut results = Vec::new();

    for (vault_id, vault_name, vault_path) in &vaults {
        let base = Path::new(vault_path);
        if !base.exists() { continue; }

        let mut notes = Vec::new();
        collect_notes(base, base, true, &mut notes).ok();

        for note in notes {
            // Search in filename
            let filename_match = note.filename.to_lowercase().contains(&query_lower);

            // Search in content
            let content = fs::read_to_string(&note.absolute_path).unwrap_or_default();
            let body = strip_frontmatter(&content);
            let content_match = body.to_lowercase().contains(&query_lower);

            if filename_match || content_match {
                let matched_line = if filename_match {
                    format!("Title: {}", note.filename)
                } else {
                    // Find the first matching line
                    body.lines()
                        .find(|line| line.to_lowercase().contains(&query_lower))
                        .unwrap_or("")
                        .trim()
                        .chars()
                        .take(100)
                        .collect::<String>()
                };

                results.push(SearchResult {
                    vault_name: vault_name.clone(),
                    vault_id: vault_id.clone(),
                    note,
                    matched_line,
                });
            }
        }
    }

    // Limit to 50 results
    results.truncate(50);
    Ok(results)
}

#[tauri::command]
pub fn list_notes(vault_path: String, recursive: bool) -> Result<Vec<NoteMeta>, String> {
    let base = Path::new(&vault_path);
    if !base.exists() {
        return Err(format!("Vault path does not exist: {}", vault_path));
    }

    let mut notes = Vec::new();
    collect_notes(base, base, recursive, &mut notes)?;
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
            let dir_name = path.file_name().unwrap_or_default().to_string_lossy();
            if !dir_name.starts_with('.') {
                collect_notes(base, &path, recursive, notes)?;
            }
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

                    // Try to extract title from YAML frontmatter (goalTitle field)
                    let filename = extract_frontmatter_title(&path)
                        .unwrap_or_else(|| {
                            path.file_stem()
                                .unwrap_or_default()
                                .to_string_lossy()
                                .to_string()
                        });

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

/// Try to extract a display title from YAML frontmatter.
/// Looks for goalTitle, title, or similar fields.
fn extract_frontmatter_title(path: &Path) -> Option<String> {
    let content = fs::read_to_string(path).ok()?;
    if !content.starts_with("---") {
        return None;
    }
    let end_idx = content[3..].find("---")?;
    let frontmatter = &content[3..3 + end_idx];

    for line in frontmatter.lines() {
        let line = line.trim();
        if let Some((key, val)) = line.split_once(':') {
            let key = key.trim();
            let val = val.trim().trim_matches('"').trim();
            if key == "goalTitle" || key == "title" {
                if !val.is_empty() {
                    return Some(val.to_string());
                }
            }
        }
    }

    None
}

/// Strip YAML frontmatter from content, returning only the body
fn strip_frontmatter(content: &str) -> String {
    if content.starts_with("---") {
        if let Some(end_idx) = content[3..].find("---") {
            return content[3 + end_idx + 3..].trim().to_string();
        }
    }
    content.to_string()
}

#[tauri::command]
pub fn read_note(path: String) -> Result<String, String> {
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    Ok(strip_frontmatter(&content))
}

#[tauri::command]
pub fn read_notes_batch(paths: Vec<String>) -> Result<HashMap<String, String>, String> {
    let mut results = HashMap::new();
    for path in paths {
        match fs::read_to_string(&path) {
            Ok(content) => {
                results.insert(path, strip_frontmatter(&content));
            }
            Err(e) => {
                results.insert(path, format!("Error reading file: {}", e));
            }
        }
    }
    Ok(results)
}
