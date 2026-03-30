use crate::config;
use crate::models::{Alignment, Edge, WindowConfig};
use tauri::{AppHandle, Emitter, Manager};

/// Usable screen area (excluding menubar, dock, taskbar)
struct ScreenArea {
    x: f64,
    y: f64,
    w: f64,
    h: f64,
}

/// Get the usable screen area. On macOS this excludes the menubar and dock.
/// When follow_active is false, uses the monitor the window is currently on.
/// When follow_active is true, uses the currently active/focused monitor.
fn get_usable_screen(window: &tauri::WebviewWindow, follow_active: bool) -> Result<ScreenArea, String> {
    #[cfg(target_os = "macos")]
    {
        use objc2::MainThreadMarker;
        use objc2_app_kit::NSScreen;
        let mtm = unsafe { MainThreadMarker::new_unchecked() };

        if follow_active {
            // Use the main screen (the one with the currently focused window)
            let screen = NSScreen::mainScreen(mtm).ok_or("No main screen")?;
            let visible = screen.visibleFrame();
            let full = screen.frame();
            let top_offset = full.size.height - (visible.origin.y + visible.size.height);

            return Ok(ScreenArea {
                x: visible.origin.x,
                y: top_offset,
                w: visible.size.width,
                h: visible.size.height,
            });
        } else {
            // Use the monitor the window is currently on
            let monitor = window.current_monitor()
                .map_err(|e| e.to_string())?
                .ok_or("No monitor found")?;
            let scale = monitor.scale_factor();
            let pos = monitor.position();
            let size = monitor.size();

            // For the primary approach, we still want to account for menubar/dock
            // Try to find the matching NSScreen for accurate visibleFrame
            let screens = NSScreen::screens(mtm);
            for ns_screen in screens.iter() {
                let frame = ns_screen.frame();
                let mon_x = pos.x as f64 / scale;
                let mon_y = pos.y as f64 / scale;
                // Match by position (approximately)
                if (frame.origin.x - mon_x).abs() < 2.0 {
                    let visible = ns_screen.visibleFrame();
                    let top_offset = frame.size.height - (visible.origin.y - frame.origin.y + visible.size.height);
                    return Ok(ScreenArea {
                        x: visible.origin.x,
                        y: mon_y + top_offset,
                        w: visible.size.width,
                        h: visible.size.height,
                    });
                }
            }

            // Fallback: use monitor size without dock/menubar adjustment
            return Ok(ScreenArea {
                x: pos.x as f64 / scale,
                y: pos.y as f64 / scale,
                w: size.width as f64 / scale,
                h: size.height as f64 / scale,
            });
        }
    }

    #[cfg(target_os = "windows")]
    {
        use windows_sys::Win32::UI::WindowsAndMessaging::{SystemParametersInfoW, SPI_GETWORKAREA};
        use windows_sys::Win32::Foundation::RECT;

        let mut rect = RECT { left: 0, top: 0, right: 0, bottom: 0 };
        let success = unsafe {
            SystemParametersInfoW(
                SPI_GETWORKAREA,
                0,
                &mut rect as *mut RECT as *mut _,
                0,
            )
        };

        if success != 0 {
            let monitor = window
                .current_monitor()
                .map_err(|e| e.to_string())?
                .ok_or("No monitor found")?;
            let scale = monitor.scale_factor();

            return Ok(ScreenArea {
                x: rect.left as f64 / scale,
                y: rect.top as f64 / scale,
                w: (rect.right - rect.left) as f64 / scale,
                h: (rect.bottom - rect.top) as f64 / scale,
            });
        }

        // Fallback if the call fails
        let monitor = window
            .current_monitor()
            .map_err(|e| e.to_string())?
            .ok_or("No monitor found")?;
        let scale = monitor.scale_factor();
        return Ok(ScreenArea {
            x: 0.0,
            y: 0.0,
            w: monitor.size().width as f64 / scale,
            h: monitor.size().height as f64 / scale,
        });
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let monitor = window
            .current_monitor()
            .map_err(|e| e.to_string())?
            .ok_or("No monitor found")?;
        let scale = monitor.scale_factor();
        Ok(ScreenArea {
            x: 0.0,
            y: 0.0,
            w: monitor.size().width as f64 / scale,
            h: monitor.size().height as f64 / scale,
        })
    }
}

/// The window is always full size (handle + panel). This computes that fixed size
/// and two positions: "hidden" (panel off-screen, handle visible) and "shown" (everything on-screen).
struct Geometry {
    w: f64,
    h: f64,
    hidden_x: f64,
    hidden_y: f64,
    shown_x: f64,
    shown_y: f64,
}

fn compute_geometry(cfg: &WindowConfig, area: &ScreenArea) -> Geometry {
    let thickness = cfg.handle_thickness as f64;
    let length = cfg.handle_length as f64;
    let panel_w = (area.w * cfg.panel_width_pct as f64 / 100.0).round();
    let panel_h = (area.h * cfg.panel_height_pct as f64 / 100.0).round();

    match cfg.edge {
        Edge::Right | Edge::Left => {
            let w = thickness + panel_w;
            let h = panel_h.max(length);

            let align_y = area.y + match cfg.alignment {
                Alignment::Start => 0.0,
                Alignment::Center => (area.h - h) / 2.0,
                Alignment::End => area.h - h,
            };

            let (hidden_x, shown_x) = match cfg.edge {
                Edge::Right => (area.x + area.w - thickness, area.x + area.w - w),
                Edge::Left => (area.x - panel_w, area.x),
                _ => unreachable!(),
            };

            Geometry { w, h, hidden_x, hidden_y: align_y, shown_x, shown_y: align_y }
        }
        Edge::Top | Edge::Bottom => {
            let w = panel_w.max(length);
            let h = thickness + panel_h;

            let align_x = area.x + match cfg.alignment {
                Alignment::Start => 0.0,
                Alignment::Center => (area.w - w) / 2.0,
                Alignment::End => area.w - w,
            };

            let (hidden_y, shown_y) = match cfg.edge {
                Edge::Top => (area.y - panel_h, area.y),
                Edge::Bottom => (area.y + area.h - thickness, area.y + area.h - h),
                _ => unreachable!(),
            };

            Geometry { w, h, hidden_x: align_x, hidden_y, shown_x: align_x, shown_y }
        }
    }
}

#[tauri::command]
pub async fn slide_window(app: AppHandle, visible: bool) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("Window not found")?;

    let cfg = config::load_config().window;
    let follow = cfg.monitor_mode == "follow";
    let area = get_usable_screen(&window, follow)?;
    let geo = compute_geometry(&cfg, &area);

    let delay = cfg.animation_delay as u64;
    let duration = cfg.animation_duration as u64;

    let (start_x, start_y, end_x, end_y) = if visible {
        (geo.hidden_x, geo.hidden_y, geo.shown_x, geo.shown_y)
    } else {
        (geo.shown_x, geo.shown_y, geo.hidden_x, geo.hidden_y)
    };

    // When opening: emit state before animation so content is visible during slide
    // When closing: emit state after animation so content stays visible during slide
    if visible {
        window.emit("slide-state", true).map_err(|e| e.to_string())?;
    }

    if visible && delay > 0 {
        tokio::time::sleep(std::time::Duration::from_millis(delay)).await;
    }

    if duration == 0 {
        window.set_position(tauri::LogicalPosition::new(end_x, end_y)).map_err(|e| e.to_string())?;
    } else {
        let steps = (duration / 16).max(1) as usize;
        let step_ms = duration as f64 / steps as f64;

        for i in 1..=steps {
            let t = i as f64 / steps as f64;
            let eased = ease_out_cubic(t);

            let x = start_x + (end_x - start_x) * eased;
            let y = start_y + (end_y - start_y) * eased;

            window.set_position(tauri::LogicalPosition::new(x, y)).map_err(|e| e.to_string())?;
            tokio::time::sleep(std::time::Duration::from_millis(step_ms as u64)).await;
        }

        // Ensure exact final position
        window.set_position(tauri::LogicalPosition::new(end_x, end_y)).map_err(|e| e.to_string())?;
    }

    // When closing: emit state after animation so panel was visible during the slide out
    if !visible {
        window.emit("slide-state", false).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub async fn position_window(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("Window not found")?;

    let cfg = config::load_config().window;
    let follow = cfg.monitor_mode == "follow";
    let area = get_usable_screen(&window, follow)?;
    let geo = compute_geometry(&cfg, &area);

    // Set full size and position at hidden (panel off-screen)
    window.set_size(tauri::LogicalSize::new(geo.w, geo.h)).map_err(|e| e.to_string())?;
    window.set_position(tauri::LogicalPosition::new(geo.hidden_x, geo.hidden_y)).map_err(|e| e.to_string())?;
    window.show().map_err(|e| e.to_string())?;

    Ok(())
}

/// Reposition the handle to follow the active monitor (only when collapsed).
#[tauri::command]
pub async fn follow_monitor(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("Window not found")?;

    let cfg = config::load_config().window;
    if cfg.monitor_mode != "follow" {
        return Ok(());
    }

    let area = get_usable_screen(&window, true)?;
    let geo = compute_geometry(&cfg, &area);

    // Reposition to the active monitor's hidden position
    window.set_size(tauri::LogicalSize::new(geo.w, geo.h)).map_err(|e| e.to_string())?;
    window.set_position(tauri::LogicalPosition::new(geo.hidden_x, geo.hidden_y)).map_err(|e| e.to_string())?;

    Ok(())
}

/// Reposition the window after settings change. Collapses back to handle position.
#[tauri::command]
pub async fn reposition_window(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("Window not found")?;

    window.emit("slide-state", false).map_err(|e| e.to_string())?;

    let cfg = config::load_config().window;
    let follow = cfg.monitor_mode == "follow";
    let area = get_usable_screen(&window, follow)?;
    let geo = compute_geometry(&cfg, &area);

    window.set_size(tauri::LogicalSize::new(geo.w, geo.h)).map_err(|e| e.to_string())?;
    window.set_position(tauri::LogicalPosition::new(geo.hidden_x, geo.hidden_y)).map_err(|e| e.to_string())?;

    Ok(())
}

fn ease_out_cubic(t: f64) -> f64 {
    1.0 - (1.0 - t).powi(3)
}

#[tauri::command]
pub fn quit_app(app: AppHandle) {
    app.exit(0);
}
