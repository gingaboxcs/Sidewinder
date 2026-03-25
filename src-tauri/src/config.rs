use crate::models::AppConfig;
use std::fs;
use std::path::PathBuf;

fn config_path() -> PathBuf {
    let data_dir = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
    let app_dir = data_dir.join("com.sidewinder.notes");
    fs::create_dir_all(&app_dir).ok();
    app_dir.join("vaults.json")
}

pub fn load_config() -> AppConfig {
    let path = config_path();
    if path.exists() {
        let content = fs::read_to_string(&path).unwrap_or_default();
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        AppConfig::default()
    }
}

pub fn save_config(config: &AppConfig) -> Result<(), String> {
    let path = config_path();
    let content = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())
}
