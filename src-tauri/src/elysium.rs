use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

/// A schedule item from an .ot file — contains all possible fields across all types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElysiumItem {
    pub id: String,
    pub title: String,
    #[serde(rename = "type")]
    pub item_type: String,
    // Common
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub notes: Option<String>,
    #[serde(default)]
    pub links: Vec<ElysiumLink>,
    // Goal / Project
    #[serde(default)]
    pub target_date: Option<String>,
    #[serde(default)]
    pub progress: Option<f64>,
    #[serde(default)]
    pub project_id: Option<String>,
    #[serde(default)]
    pub goal_id: Option<String>,
    #[serde(default)]
    pub kind: Option<String>,
    #[serde(default)]
    pub children: Vec<String>,
    // Task
    #[serde(default)]
    pub status: Option<String>,
    #[serde(default)]
    pub due: Option<String>,
    #[serde(default)]
    pub scheduled_start: Option<String>,
    #[serde(default)]
    pub estimate_minutes: Option<i32>,
    #[serde(default)]
    pub actual_minutes: Option<i32>,
    #[serde(default)]
    pub priority: Option<f64>,
    // Event / Appointment
    #[serde(default)]
    pub start: Option<String>,
    #[serde(default)]
    pub end: Option<String>,
    #[serde(default)]
    pub all_day: Option<bool>,
    #[serde(default)]
    pub timezone: Option<String>,
    #[serde(default)]
    pub location: Option<String>,
    #[serde(default)]
    pub recurrence: Option<String>,
    #[serde(default)]
    pub attendees: Vec<String>,
    #[serde(default)]
    pub provider: Option<String>,
    // Reminder
    #[serde(default)]
    pub time: Option<String>,
    #[serde(default)]
    pub repeat: Option<String>,
    #[serde(default)]
    pub link: Option<String>,
    // Habit
    #[serde(default)]
    pub pattern: Option<ElysiumHabitPattern>,
    #[serde(default)]
    pub window: Option<ElysiumHabitWindow>,
    #[serde(default)]
    pub streak: Option<ElysiumHabitStreak>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElysiumLink {
    pub kind: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElysiumHabitPattern {
    #[serde(default)]
    pub freq: Option<String>,
    #[serde(default)]
    pub days_of_week: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElysiumHabitWindow {
    #[serde(default)]
    pub start_time: Option<String>,
    #[serde(default)]
    pub end_time: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElysiumHabitStreak {
    #[serde(default)]
    pub current: Option<i32>,
    #[serde(default)]
    pub longest: Option<i32>,
}

/// A note from a .md file in the Notes/ folder
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElysiumNote {
    pub id: String,
    pub goal_id: String,
    pub goal_title: String,
    pub author: String,
    pub author_email: String,
    pub author_profile_picture: String,
    pub created_at: String,
    pub content: String,
    pub filename: String,
    pub absolute_path: String,
}

/// Raw .ot YAML structure
#[derive(Debug, Deserialize)]
struct OtDocument {
    #[serde(default = "default_version")]
    opentime_version: String,
    #[serde(default)]
    items: Vec<serde_yaml::Value>,
}

fn default_version() -> String { "0.2".to_string() }

/// Parse all .ot files in the given OpenTime directory and return schedule items
#[tauri::command]
pub fn load_elysium_items(opentime_path: String) -> Result<Vec<ElysiumItem>, String> {
    let dir = Path::new(&opentime_path);
    if !dir.exists() {
        return Err(format!("OpenTime directory does not exist: {}", opentime_path));
    }

    let mut items = Vec::new();
    let mut seen_ids = std::collections::HashSet::new();

    let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_file() {
            if let Some(ext) = path.extension() {
                if ext == "ot" || ext == "otime" {
                    match parse_ot_file(&path) {
                        Ok(file_items) => {
                            for item in file_items {
                                if seen_ids.insert(item.id.clone()) {
                                    items.push(item);
                                }
                            }
                        }
                        Err(e) => eprintln!("Failed to parse {:?}: {}", path, e),
                    }
                }
            }
        }
    }

    Ok(items)
}

fn parse_ot_file(path: &Path) -> Result<Vec<ElysiumItem>, String> {
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let doc: OtDocument = serde_yaml::from_str(&content).map_err(|e| e.to_string())?;

    let mut items = Vec::new();
    for raw_value in doc.items {
        // Parse each item using serde_yaml Value -> ElysiumItem
        match parse_item_from_value(&raw_value) {
            Some(item) => items.push(item),
            None => continue,
        }
    }

    Ok(items)
}

fn parse_item_from_value(val: &serde_yaml::Value) -> Option<ElysiumItem> {
    let map = val.as_mapping()?;

    let get_str = |key: &str| -> Option<String> {
        map.get(serde_yaml::Value::String(key.to_string()))
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
    };

    let get_f64 = |key: &str| -> Option<f64> {
        map.get(serde_yaml::Value::String(key.to_string()))
            .and_then(|v| v.as_f64())
    };

    let get_i32 = |key: &str| -> Option<i32> {
        map.get(serde_yaml::Value::String(key.to_string()))
            .and_then(|v| v.as_i64())
            .map(|n| n as i32)
    };

    let get_bool = |key: &str| -> Option<bool> {
        map.get(serde_yaml::Value::String(key.to_string()))
            .and_then(|v| v.as_bool())
    };

    let get_string_array = |key: &str| -> Vec<String> {
        map.get(serde_yaml::Value::String(key.to_string()))
            .and_then(|v| v.as_sequence())
            .map(|seq| seq.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect())
            .unwrap_or_default()
    };

    let id = get_str("id")?;
    let title = get_str("title")?;
    let item_type = get_str("type")?;

    if id.is_empty() || title.is_empty() {
        return None;
    }

    // Parse links
    let links: Vec<ElysiumLink> = map.get(serde_yaml::Value::String("links".to_string()))
        .and_then(|v| v.as_sequence())
        .map(|seq| seq.iter().filter_map(|v| {
            let m = v.as_mapping()?;
            let kind = m.get(serde_yaml::Value::String("kind".to_string()))?.as_str()?.to_string();
            let value = m.get(serde_yaml::Value::String("value".to_string()))?.as_str()?.to_string();
            Some(ElysiumLink { kind, value })
        }).collect())
        .unwrap_or_default();

    // Parse habit-specific nested objects
    let pattern = map.get(serde_yaml::Value::String("pattern".to_string()))
        .and_then(|v| {
            let m = v.as_mapping()?;
            Some(ElysiumHabitPattern {
                freq: m.get(serde_yaml::Value::String("freq".to_string()))
                    .and_then(|v| v.as_str()).map(|s| s.to_string()),
                days_of_week: m.get(serde_yaml::Value::String("days_of_week".to_string()))
                    .and_then(|v| v.as_sequence())
                    .map(|seq| seq.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect())
                    .unwrap_or_default(),
            })
        });

    let window = map.get(serde_yaml::Value::String("window".to_string()))
        .and_then(|v| {
            let m = v.as_mapping()?;
            Some(ElysiumHabitWindow {
                start_time: m.get(serde_yaml::Value::String("start_time".to_string()))
                    .and_then(|v| v.as_str()).map(|s| s.to_string()),
                end_time: m.get(serde_yaml::Value::String("end_time".to_string()))
                    .and_then(|v| v.as_str()).map(|s| s.to_string()),
            })
        });

    let streak = map.get(serde_yaml::Value::String("streak".to_string()))
        .and_then(|v| {
            let m = v.as_mapping()?;
            Some(ElysiumHabitStreak {
                current: m.get(serde_yaml::Value::String("current".to_string()))
                    .and_then(|v| v.as_i64()).map(|n| n as i32),
                longest: m.get(serde_yaml::Value::String("longest".to_string()))
                    .and_then(|v| v.as_i64()).map(|n| n as i32),
            })
        });

    Some(ElysiumItem {
        id,
        title,
        item_type,
        tags: get_string_array("tags"),
        notes: get_str("notes"),
        links,
        target_date: get_str("target_date"),
        progress: get_f64("progress"),
        project_id: get_str("project_id"),
        goal_id: get_str("goal_id"),
        kind: get_str("kind"),
        children: get_string_array("children").into_iter()
            .chain(get_string_array("children_by_title").into_iter())
            .collect(),
        status: get_str("status"),
        due: get_str("due"),
        scheduled_start: get_str("scheduled_start"),
        estimate_minutes: get_i32("estimate_minutes"),
        actual_minutes: get_i32("actual_minutes"),
        priority: get_f64("priority"),
        start: get_str("start"),
        end: get_str("end"),
        all_day: get_bool("all_day"),
        timezone: get_str("timezone"),
        location: get_str("location"),
        recurrence: get_str("recurrence"),
        attendees: get_string_array("attendees"),
        provider: get_str("provider"),
        time: get_str("time"),
        repeat: get_str("repeat"),
        link: get_str("link"),
        pattern,
        window,
        streak,
    })
}

/// Load notes from the Notes/ subfolder for a specific goal/item
#[tauri::command]
pub fn load_elysium_notes(opentime_path: String, goal_title: String) -> Result<Vec<ElysiumNote>, String> {
    let notes_dir = Path::new(&opentime_path).join("Notes");
    if !notes_dir.exists() {
        return Ok(Vec::new());
    }

    let sanitized = sanitize_title(&goal_title);
    let mut notes = Vec::new();
    let entries = fs::read_dir(&notes_dir).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_dir() {
            let folder_name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
            if folder_name.to_lowercase() == sanitized.to_lowercase() {
                let md_entries = fs::read_dir(&path).map_err(|e| e.to_string())?;
                for md_entry in md_entries {
                    let md_entry = md_entry.map_err(|e| e.to_string())?;
                    let md_path = md_entry.path();
                    if md_path.extension().map_or(false, |e| e == "md") {
                        match parse_note_file(&md_path, &goal_title) {
                            Ok(note) => notes.push(note),
                            Err(e) => eprintln!("Failed to parse note {:?}: {}", md_path, e),
                        }
                    }
                }
            }
        }
    }

    notes.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(notes)
}

/// Load all notes from all goal folders
#[tauri::command]
pub fn load_all_elysium_notes(opentime_path: String) -> Result<HashMap<String, Vec<ElysiumNote>>, String> {
    let notes_dir = Path::new(&opentime_path).join("Notes");
    if !notes_dir.exists() {
        return Ok(HashMap::new());
    }

    let mut result: HashMap<String, Vec<ElysiumNote>> = HashMap::new();
    let entries = fs::read_dir(&notes_dir).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_dir() {
            let folder_name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
            let md_entries = fs::read_dir(&path).map_err(|e| e.to_string())?;
            for md_entry in md_entries {
                let md_entry = md_entry.map_err(|e| e.to_string())?;
                let md_path = md_entry.path();
                if md_path.extension().map_or(false, |e| e == "md") {
                    match parse_note_file(&md_path, &folder_name) {
                        Ok(note) => {
                            result.entry(note.goal_title.clone()).or_default().push(note);
                        }
                        Err(e) => eprintln!("Failed to parse note {:?}: {}", md_path, e),
                    }
                }
            }
        }
    }

    for notes in result.values_mut() {
        notes.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    }

    Ok(result)
}

fn parse_note_file(path: &Path, fallback_title: &str) -> Result<ElysiumNote, String> {
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let filename = path.file_stem().unwrap_or_default().to_string_lossy().to_string();

    let mut id = String::new();
    let mut goal_id = String::new();
    let mut goal_title = fallback_title.to_string();
    let mut author = String::new();
    let mut author_email = String::new();
    let mut author_profile_picture = String::new();
    let mut created_at = String::new();
    let mut body = content.clone();

    if content.starts_with("---") {
        if let Some(end_idx) = content[3..].find("---") {
            let frontmatter = &content[3..3 + end_idx];
            body = content[3 + end_idx + 3..].trim().to_string();

            for line in frontmatter.lines() {
                let line = line.trim();
                if let Some((key, val)) = line.split_once(':') {
                    let key = key.trim();
                    let val = val.trim().trim_matches('"');
                    match key {
                        "id" => id = val.to_string(),
                        "goalId" => goal_id = val.to_string(),
                        "goalTitle" => goal_title = val.to_string(),
                        "author" => author = val.to_string(),
                        "authorEmail" => author_email = val.to_string(),
                        "authorProfilePicture" => author_profile_picture = val.to_string(),
                        "createdAt" => created_at = val.to_string(),
                        _ => {}
                    }
                }
            }
        }
    }

    if id.is_empty() {
        id = uuid::Uuid::new_v4().to_string();
    }

    Ok(ElysiumNote {
        id,
        goal_id,
        goal_title,
        author,
        author_email,
        author_profile_picture,
        created_at,
        content: body,
        filename,
        absolute_path: path.to_string_lossy().to_string(),
    })
}

fn sanitize_title(title: &str) -> String {
    let sanitized: String = title.chars().map(|c| {
        if c.is_alphanumeric() || c == '-' || c == '_' || c == ' ' {
            c
        } else {
            '-'
        }
    }).collect();
    let trimmed = sanitized.trim().to_string();
    if trimmed.len() > 50 {
        trimmed[..50].to_string()
    } else {
        trimmed
    }
}

/// Get all note folders from the Notes/ directory
#[tauri::command]
pub fn get_elysium_note_folders(opentime_path: String) -> Result<Vec<ElysiumNoteFolder>, String> {
    let notes_dir = Path::new(&opentime_path).join("Notes");
    if !notes_dir.exists() {
        return Ok(Vec::new());
    }

    let mut folders = Vec::new();
    let entries = fs::read_dir(&notes_dir).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_dir() {
            let name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
            let count = fs::read_dir(&path)
                .map(|entries| entries.filter(|e| {
                    e.as_ref().ok().map_or(false, |e| {
                        e.path().extension().map_or(false, |ext| ext == "md")
                    })
                }).count())
                .unwrap_or(0);

            if count > 0 {
                folders.push(ElysiumNoteFolder {
                    name: name.clone(),
                    path: path.to_string_lossy().to_string(),
                    note_count: count,
                });
            }
        }
    }

    folders.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(folders)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElysiumNoteFolder {
    pub name: String,
    pub path: String,
    pub note_count: usize,
}

/// Read the current Elysium user's profile from the app's cached UserDefaults
#[tauri::command]
pub fn get_elysium_user_profile() -> Result<ElysiumUserProfile, String> {
    #[cfg(target_os = "macos")]
    {
        let home = dirs::home_dir().ok_or("Cannot find home directory")?;
        let plist_path = home.join("Library/Preferences/gingabox.Elysium.plist");

        if !plist_path.exists() {
            return Err("Elysium preferences not found. Is Elysium installed?".to_string());
        }

        // Read the plist as a dictionary
        let content = fs::read(&plist_path).map_err(|e| e.to_string())?;
        let cursor = std::io::Cursor::new(content);
        let plist_val = plist::Value::from_reader(cursor).map_err(|e| e.to_string())?;

        let dict = plist_val.as_dictionary().ok_or("Invalid plist format")?;

        let display_name = dict.get("profile.displayName")
            .and_then(|v| v.as_string())
            .unwrap_or("")
            .to_string();

        let email = dict.get("profile.email")
            .and_then(|v| v.as_string())
            .unwrap_or("")
            .to_string();

        let profile_picture_path = dict.get("profile.profilePictureURL")
            .and_then(|v| v.as_string())
            .unwrap_or("")
            .to_string();

        // Resolve the relative storage path to a full Supabase public URL
        let profile_picture_url = if profile_picture_path.is_empty() {
            String::new()
        } else {
            format!(
                "https://auth.elysium.is/storage/v1/object/public/Profile%20Pics/{}",
                profile_picture_path
            )
        };

        let subscription_tier = dict.get("subscription.tier")
            .and_then(|v| v.as_string())
            .unwrap_or("")
            .to_string();

        let subscription_status = dict.get("subscription.status")
            .and_then(|v| v.as_string())
            .unwrap_or("")
            .to_string();

        Ok(ElysiumUserProfile {
            display_name,
            email,
            profile_picture_url,
            subscription_tier,
            subscription_status,
        })
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err("Elysium profile reading is only supported on macOS".to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElysiumUserProfile {
    pub display_name: String,
    pub email: String,
    pub profile_picture_url: String,
    pub subscription_tier: String,
    pub subscription_status: String,
}

/// Create a new note in the Elysium Notes folder with proper frontmatter
#[tauri::command]
pub fn create_elysium_note(
    opentime_path: String,
    goal_title: String,
    content: String,
    author: String,
    author_email: String,
) -> Result<ElysiumNote, String> {
    let notes_dir = Path::new(&opentime_path).join("Notes");
    let sanitized = sanitize_title(&goal_title);
    let goal_dir = notes_dir.join(&sanitized);

    // Create the folder if it doesn't exist
    fs::create_dir_all(&goal_dir).map_err(|e| e.to_string())?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono_now();
    let filename = format!("{}-{}", sanitized, now.replace(':', "-"));
    let file_path = goal_dir.join(format!("{}.md", filename));

    let frontmatter = format!(
        "---\nid: {}\ngoalTitle: \"{}\"\nauthor: \"{}\"\nauthorEmail: \"{}\"\ncreatedAt: {}\nupdatedAt: {}\n---\n\n{}",
        id, goal_title, author, author_email, now, now, content
    );

    fs::write(&file_path, &frontmatter).map_err(|e| e.to_string())?;

    Ok(ElysiumNote {
        id,
        goal_id: String::new(),
        goal_title,
        author,
        author_email,
        author_profile_picture: String::new(),
        created_at: now,
        content,
        filename,
        absolute_path: file_path.to_string_lossy().to_string(),
    })
}

fn chrono_now() -> String {
    use std::time::SystemTime;
    let now = SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    // Format as ISO8601
    let secs_per_day = 86400u64;
    let days = now / secs_per_day;
    let time = now % secs_per_day;
    let hours = time / 3600;
    let minutes = (time % 3600) / 60;
    let seconds = time % 60;

    // Simple epoch to date conversion
    let mut y = 1970i64;
    let mut remaining = days as i64;
    loop {
        let days_in_year = if y % 4 == 0 && (y % 100 != 0 || y % 400 == 0) { 366 } else { 365 };
        if remaining < days_in_year { break; }
        remaining -= days_in_year;
        y += 1;
    }
    let leap = y % 4 == 0 && (y % 100 != 0 || y % 400 == 0);
    let month_days = [31, if leap { 29 } else { 28 }, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let mut m = 0usize;
    for md in &month_days {
        if remaining < *md as i64 { break; }
        remaining -= *md as i64;
        m += 1;
    }
    let d = remaining + 1;

    format!("{:04}-{:02}-{:02}T{:02}:{:02}:{:02}Z", y, m + 1, d, hours, minutes, seconds)
}

/// Open a specific item in Elysium via deep link
#[tauri::command]
pub fn open_in_elysium(item_type: String, item_id: String) -> Result<(), String> {
    let url = if item_type.is_empty() || item_id.is_empty() {
        "elysium://".to_string()
    } else {
        let url_type = if item_type == "project" { "odyssey" } else { &item_type };
        format!("elysium://{}/{}", url_type, item_id)
    };

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "start", &url])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
