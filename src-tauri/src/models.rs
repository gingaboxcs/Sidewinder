use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub vaults: Vec<Vault>,
    pub window: WindowConfig,
    #[serde(default)]
    pub vault_sort_mode: SortMode,
    #[serde(default = "default_true")]
    pub vault_sort_descending: bool,
    #[serde(default)]
    pub vault_order: Vec<String>,
    #[serde(default)]
    pub elysium: ElysiumConfig,
    #[serde(default)]
    pub license: LicenseConfig,
    #[serde(default)]
    pub shortcuts: ShortcutsConfig,
    #[serde(default)]
    pub onboarding_complete: bool,
    #[serde(default)]
    pub language: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShortcutsConfig {
    pub toggle_panel: String,
    pub new_note: String,
    pub new_folder: String,
    pub go_back: String,
    pub open_settings: String,
    pub open_calendar: String,
    pub quit_app: String,
}

impl Default for ShortcutsConfig {
    fn default() -> Self {
        Self {
            toggle_panel: "CommandOrControl+Alt+X".to_string(),
            new_note: "CommandOrControl+N".to_string(),
            new_folder: "CommandOrControl+Alt+D".to_string(),
            go_back: "CommandOrControl+Backspace".to_string(),
            open_settings: "CommandOrControl+,".to_string(),
            open_calendar: "CommandOrControl+Alt+C".to_string(),
            quit_app: "CommandOrControl+Q".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LicenseConfig {
    /// "free", "paid", or "elysium"
    pub status: String,
    /// Purchase key if paid directly
    pub license_key: String,
}

impl Default for LicenseConfig {
    fn default() -> Self {
        Self {
            status: "free".to_string(),
            license_key: String::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElysiumConfig {
    pub enabled: bool,
    pub opentime_path: String,
    pub auto_import_notes: bool,
    #[serde(default)]
    pub hidden_types: Vec<String>,
    /// "separate" = own section, "integrated" = mixed with regular vaults
    #[serde(default = "default_display_mode")]
    pub display_mode: String,
    /// Override for the author name (if empty, reads from Elysium's cached profile)
    #[serde(default)]
    pub author_name_override: String,
    #[serde(default)]
    pub author_email_override: String,
}

fn default_display_mode() -> String { "separate".to_string() }
fn default_true() -> bool { true }

impl Default for ElysiumConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            opentime_path: String::new(),
            auto_import_notes: false,
            hidden_types: Vec::new(),
            display_mode: "separate".to_string(),
            author_name_override: String::new(),
            author_email_override: String::new(),
        }
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            vaults: Vec::new(),
            window: WindowConfig::default(),
            vault_sort_mode: SortMode::default(),
            vault_sort_descending: true,
            vault_order: Vec::new(),
            elysium: ElysiumConfig::default(),
            license: LicenseConfig::default(),
            shortcuts: ShortcutsConfig::default(),
            onboarding_complete: false,
            language: String::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Vault {
    pub id: String,
    pub name: String,
    pub path: String,
    pub view_mode: ViewMode,
    pub edit_mode: EditMode,
    pub sort_mode: SortMode,
    #[serde(default = "default_true")]
    pub sort_descending: bool,
    pub recursive: bool,
    pub note_overrides: HashMap<String, NoteOverride>,
    /// Manual note ordering — list of relative paths
    #[serde(default)]
    pub note_order: Vec<String>,
    /// Per-folder settings overrides, keyed by relative folder path
    #[serde(default)]
    pub folder_overrides: HashMap<String, FolderOverride>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NoteOverride {
    pub view_mode: Option<ViewMode>,
    pub edit_mode: Option<EditMode>,
    #[serde(default)]
    pub pinned: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderOverride {
    #[serde(default)]
    pub edit_mode: Option<EditMode>,
    #[serde(default)]
    pub sort_mode: Option<SortMode>,
    #[serde(default)]
    pub sort_descending: Option<bool>,
    #[serde(default)]
    pub view_mode: Option<ViewMode>,
    #[serde(default)]
    pub note_order: Vec<String>,
    #[serde(default)]
    pub folder_order: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ViewMode {
    Accordion,
    Full,
    AlwaysOpen,
}

impl Default for ViewMode {
    fn default() -> Self {
        Self::Accordion
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum EditMode {
    Markdown,
    Code,
    Plaintext,
}

impl Default for EditMode {
    fn default() -> Self {
        Self::Markdown
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SortMode {
    Alphabetical,
    Modified,
    Manual,
}

impl Default for SortMode {
    fn default() -> Self {
        Self::Alphabetical
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowConfig {
    pub edge: Edge,
    pub alignment: Alignment,
    /// Handle thickness in px (how far it protrudes from the screen edge)
    pub handle_thickness: u32,
    /// Handle length in px (how long it spans along the edge)
    pub handle_length: u32,
    /// Panel width as a percentage of available screen width (1-100)
    pub panel_width_pct: u32,
    /// Panel height as a percentage of available screen height (1-100)
    pub panel_height_pct: u32,
    /// Handle color as a CSS color string
    pub handle_color: String,
    /// Panel background color as a CSS color string
    pub panel_color: String,
    /// Accent color for buttons, links, active states
    pub accent_color: String,
    /// Whether to close the panel when the window loses focus
    pub close_on_blur: bool,
    /// Animation duration in milliseconds (0 = instant)
    pub animation_duration: u32,
    /// Delay before animation starts in milliseconds
    pub animation_delay: u32,
    // ── Creation defaults ──
    #[serde(default)]
    pub default_edit_mode: EditMode,
    #[serde(default = "default_position_bottom")]
    pub default_note_position: InsertPosition,
    #[serde(default = "default_position_bottom")]
    pub default_vault_position: InsertPosition,
    // ── Appearance ──
    #[serde(default = "default_theme_dark")]
    pub theme: String,
    #[serde(default = "default_font_family")]
    pub font_family: String,
    #[serde(default = "default_font_size")]
    pub font_size: u32,
    #[serde(default = "default_line_height")]
    pub line_height: u32,
    #[serde(default = "default_paragraph_spacing")]
    pub paragraph_spacing: u32,
    #[serde(default = "default_text_color")]
    pub text_color: String,
    /// "primary" = stay on one monitor, "follow" = follow active monitor
    #[serde(default = "default_monitor_mode")]
    pub monitor_mode: String,
}

fn default_monitor_mode() -> String { "primary".to_string() }

fn default_position_bottom() -> InsertPosition { InsertPosition::Bottom }
fn default_theme_dark() -> String { "dark".to_string() }
fn default_font_family() -> String { "System".to_string() }
fn default_font_size() -> u32 { 14 }
fn default_line_height() -> u32 { 160 }
fn default_paragraph_spacing() -> u32 { 8 }
fn default_text_color() -> String { "#ebebeb".to_string() }

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum InsertPosition {
    Top,
    Bottom,
}

impl Default for InsertPosition {
    fn default() -> Self {
        Self::Bottom
    }
}

impl Default for WindowConfig {
    fn default() -> Self {
        Self {
            edge: Edge::Right,
            alignment: Alignment::Center,
            handle_thickness: 20,
            handle_length: 80,
            panel_width_pct: 25,
            panel_height_pct: 75,
            handle_color: "#444444".to_string(),
            panel_color: "#232323".to_string(),
            accent_color: "#606060".to_string(),
            close_on_blur: false,
            animation_duration: 200,
            animation_delay: 0,
            default_edit_mode: EditMode::default(),
            default_note_position: InsertPosition::Bottom,
            default_vault_position: InsertPosition::Bottom,
            theme: "dark".to_string(),
            font_family: "System".to_string(),
            font_size: 14,
            line_height: 160,
            paragraph_spacing: 8,
            text_color: "#ebebeb".to_string(),
            monitor_mode: "primary".to_string(),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Edge {
    Right,
    Left,
    Top,
    Bottom,
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Alignment {
    Start,
    Center,
    End,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NoteMeta {
    pub filename: String,
    pub relative_path: String,
    pub absolute_path: String,
    pub modified_at: u64,
    pub size_bytes: u64,
}
