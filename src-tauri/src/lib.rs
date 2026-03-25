mod commands;
mod config;
mod models;
mod watcher;

use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Manage watcher state
            app.manage(watcher::WatcherState {
                active_path: Mutex::new(None),
                debouncer: Mutex::new(None),
            });

            // Set up system tray
            use tauri::menu::{MenuBuilder, MenuItemBuilder};
            use tauri::tray::TrayIconBuilder;

            let show_hide = MenuItemBuilder::with_id("show_hide", "Show/Hide")
                .build(app)?;
            let quit = MenuItemBuilder::with_id("quit", "Quit")
                .build(app)?;

            let menu = MenuBuilder::new(app)
                .item(&show_hide)
                .separator()
                .item(&quit)
                .build()?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("Sidewinder")
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(move |app, event| {
                    match event.id().as_ref() {
                        "show_hide" => {
                            if let Some(window) = app.get_webview_window("main") {
                                if window.is_visible().unwrap_or(false) {
                                    let app_handle = app.clone();
                                    tauri::async_runtime::spawn(async move {
                                        let _ = commands::window::slide_window(app_handle, false).await;
                                    });
                                } else {
                                    let _ = window.show();
                                    let app_handle = app.clone();
                                    tauri::async_runtime::spawn(async move {
                                        let _ = commands::window::slide_window(app_handle, true).await;
                                    });
                                }
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            // Position the window on startup
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                // Small delay to ensure window is ready
                tokio::time::sleep(std::time::Duration::from_millis(100)).await;
                let _ = commands::window::position_window(app_handle).await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::window::slide_window,
            commands::window::position_window,
            commands::vault::load_config_cmd,
            commands::vault::save_config_cmd,
            commands::vault::add_vault,
            commands::vault::remove_vault,
            commands::vault::update_vault,
            commands::vault::update_note_override,
            commands::vault::create_vault_directory,
            commands::notes::list_notes,
            commands::notes::read_note,
            commands::notes::read_notes_batch,
            watcher::watch_vault,
            watcher::unwatch_vault,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
