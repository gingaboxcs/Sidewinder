mod commands;
mod config;
mod elysium;
mod models;
mod watcher;

use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .setup(|app| {
            // Hide from dock on macOS
            #[cfg(target_os = "macos")]
            {
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            }

            // Windows: remove all borders/frames and enable layered transparency
            #[cfg(target_os = "windows")]
            {
                let window = app.get_webview_window("main").unwrap();
                let _ = window.set_skip_taskbar(true);

                if let Ok(hwnd) = window.hwnd() {
                    let h = hwnd.0 as *mut std::ffi::c_void;
                    unsafe {
                        use windows_sys::Win32::UI::WindowsAndMessaging::*;

                        // Remove ALL border/frame styles, keep only WS_POPUP
                        // WS_BORDER, WS_THICKFRAME, WS_CAPTION, WS_DLGFRAME all cause the white line
                        let style = GetWindowLongW(h, GWL_STYLE);
                        let new_style = (style
                            & !(WS_BORDER as i32)
                            & !(WS_THICKFRAME as i32)
                            & !(WS_CAPTION as i32)
                            & !(WS_DLGFRAME as i32))
                            | WS_POPUP as i32;
                        SetWindowLongW(h, GWL_STYLE, new_style);

                        // Add WS_EX_LAYERED for transparency + WS_EX_TOOLWINDOW to hide from alt-tab
                        let ex_style = GetWindowLongW(h, GWL_EXSTYLE);
                        SetWindowLongW(
                            h,
                            GWL_EXSTYLE,
                            (ex_style | WS_EX_LAYERED as i32 | WS_EX_TOOLWINDOW as i32) & !(WS_EX_APPWINDOW as i32),
                        );

                        // Use color key transparency - magenta (#FF00FF) will be rendered as transparent
                        // We'll use this color in CSS for any area we want invisible
                        SetLayeredWindowAttributes(h, 0x00FF00FF, 255, LWA_COLORKEY);

                        // Force style update
                        SetWindowPos(
                            h,
                            std::ptr::null_mut(),
                            0, 0, 0, 0,
                            SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_FRAMECHANGED | SWP_NOACTIVATE,
                        );
                    }
                }
            }

            // Manage watcher state
            app.manage(watcher::WatcherState {
                active_path: Mutex::new(None),
                debouncer: Mutex::new(None),
                elysium_debouncer: Mutex::new(None),
            });

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
            commands::window::reposition_window,
            commands::window::follow_monitor,
            commands::window::quit_app,
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
            commands::notes::save_note,
            commands::notes::create_note,
            commands::notes::rename_note,
            commands::notes::delete_note,
            commands::notes::list_folder_contents,
            commands::notes::create_folder,
            commands::notes::delete_folder,
            commands::notes::search_notes,
            commands::notes::move_note,
            commands::notes::move_folder,
            watcher::watch_vault,
            watcher::unwatch_vault,
            watcher::watch_elysium,
            watcher::unwatch_elysium,
            elysium::load_elysium_items,
            elysium::load_elysium_notes,
            elysium::load_all_elysium_notes,
            elysium::open_in_elysium,
            elysium::get_elysium_note_folders,
            elysium::create_elysium_note,
            elysium::get_elysium_user_profile,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
