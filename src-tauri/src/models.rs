use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub vaults: Vec<Vault>,
    pub window: WindowConfig,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            vaults: Vec::new(),
            window: WindowConfig::default(),
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
    pub recursive: bool,
    pub note_overrides: HashMap<String, NoteOverride>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NoteOverride {
    pub view_mode: Option<ViewMode>,
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
#[serde(rename_all = "camelCase")]
pub struct WindowConfig {
    pub edge: Edge,
    pub width: u32,
    pub height: u32,
}

impl Default for WindowConfig {
    fn default() -> Self {
        Self {
            edge: Edge::Right,
            width: 420,
            height: 700,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Edge {
    Right,
    Left,
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
