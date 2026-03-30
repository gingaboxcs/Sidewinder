use notify::RecursiveMode;
use notify_debouncer_mini::{new_debouncer, DebouncedEventKind};
use std::path::Path;
use std::sync::Mutex;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};

pub struct WatcherState {
    pub active_path: Mutex<Option<String>>,
    // We keep the debouncer alive by storing it; dropping it stops watching
    pub debouncer: Mutex<Option<notify_debouncer_mini::Debouncer<notify::RecommendedWatcher>>>,
    // Separate watcher for Elysium OpenTime directory
    pub elysium_debouncer: Mutex<Option<notify_debouncer_mini::Debouncer<notify::RecommendedWatcher>>>,
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FsEvent {
    pub path: String,
    pub kind: String,
}

#[tauri::command]
pub fn watch_vault(app: AppHandle, vault_path: String, recursive: bool) -> Result<(), String> {
    let state = app.state::<WatcherState>();

    // Stop any existing watcher
    {
        let mut debouncer = state.debouncer.lock().map_err(|e| e.to_string())?;
        *debouncer = None;
        let mut active = state.active_path.lock().map_err(|e| e.to_string())?;
        *active = None;
    }

    let vault_path_clone = vault_path.clone();
    let emitter = app.clone();

    let mut debouncer = new_debouncer(Duration::from_millis(300), move |events: Result<Vec<notify_debouncer_mini::DebouncedEvent>, notify::Error>| {
        if let Ok(events) = events {
            for event in events {
                let path_str = event.path.to_string_lossy().to_string();

                // Only care about .md files
                if !path_str.ends_with(".md") {
                    continue;
                }

                let kind = match event.kind {
                    DebouncedEventKind::Any => {
                        if event.path.exists() {
                            "modified"
                        } else {
                            "removed"
                        }
                    }
                    DebouncedEventKind::AnyContinuous => "modified",
                    _ => "modified",
                };

                let _ = emitter.emit("fs-event", FsEvent {
                    path: path_str,
                    kind: kind.to_string(),
                });
            }
        }
    }).map_err(|e| e.to_string())?;

    let mode = if recursive {
        RecursiveMode::Recursive
    } else {
        RecursiveMode::NonRecursive
    };

    debouncer
        .watcher()
        .watch(Path::new(&vault_path), mode)
        .map_err(|e| e.to_string())?;

    // Store the debouncer to keep it alive
    {
        let mut stored = state.debouncer.lock().map_err(|e| e.to_string())?;
        *stored = Some(debouncer);
        let mut active = state.active_path.lock().map_err(|e| e.to_string())?;
        *active = Some(vault_path_clone);
    }

    Ok(())
}

#[tauri::command]
pub fn unwatch_vault(app: AppHandle) -> Result<(), String> {
    let state = app.state::<WatcherState>();
    let mut debouncer = state.debouncer.lock().map_err(|e| e.to_string())?;
    *debouncer = None;
    let mut active = state.active_path.lock().map_err(|e| e.to_string())?;
    *active = None;
    Ok(())
}

#[tauri::command]
pub fn watch_elysium(app: AppHandle, opentime_path: String) -> Result<(), String> {
    let state = app.state::<WatcherState>();

    // Stop any existing Elysium watcher
    {
        let mut debouncer = state.elysium_debouncer.lock().map_err(|e| e.to_string())?;
        *debouncer = None;
    }

    let emitter = app.clone();

    let mut debouncer = new_debouncer(Duration::from_millis(500), move |events: Result<Vec<notify_debouncer_mini::DebouncedEvent>, notify::Error>| {
        if let Ok(events) = events {
            let mut ot_changed = false;
            let mut notes_changed = false;

            for event in events {
                let path_str = event.path.to_string_lossy().to_string();
                if path_str.ends_with(".ot") || path_str.ends_with(".otime") {
                    ot_changed = true;
                }
                if path_str.ends_with(".md") {
                    notes_changed = true;
                }
            }

            if ot_changed {
                let _ = emitter.emit("elysium-schedule-changed", ());
            }
            if notes_changed {
                let _ = emitter.emit("elysium-notes-changed", ());
            }
        }
    }).map_err(|e| e.to_string())?;

    // Watch the OpenTime directory for .ot file changes
    debouncer
        .watcher()
        .watch(Path::new(&opentime_path), RecursiveMode::NonRecursive)
        .map_err(|e| e.to_string())?;

    // Watch the Notes subdirectory recursively for .md changes
    let notes_path = Path::new(&opentime_path).join("Notes");
    if notes_path.exists() {
        debouncer
            .watcher()
            .watch(&notes_path, RecursiveMode::Recursive)
            .map_err(|e| e.to_string())?;
    }

    // Store the debouncer to keep it alive
    {
        let mut stored = state.elysium_debouncer.lock().map_err(|e| e.to_string())?;
        *stored = Some(debouncer);
    }

    Ok(())
}

#[tauri::command]
pub fn unwatch_elysium(app: AppHandle) -> Result<(), String> {
    let state = app.state::<WatcherState>();
    let mut debouncer = state.elysium_debouncer.lock().map_err(|e| e.to_string())?;
    *debouncer = None;
    Ok(())
}
