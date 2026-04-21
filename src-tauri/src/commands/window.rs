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

/// Geometry for the window at hidden and shown states.
/// macOS left/right: window is full size, position changes (transparent areas invisible).
/// macOS top/bottom + ALL Windows edges: window resizes between handle-only and full size.
struct Geometry {
    /// Full window size (handle + panel)
    w: f64,
    h: f64,
    /// Handle-only size (for top/bottom resize approach)
    hidden_w: f64,
    hidden_h: f64,
    hidden_x: f64,
    hidden_y: f64,
    shown_x: f64,
    shown_y: f64,
}

/// Whether to use the resize approach (vs position-only) for sliding.
/// macOS needs resize for top/bottom (OS clamps vertical position).
/// Windows uses resize on all edges so the collapsed window is exactly
/// handle-sized — otherwise the opaque black background shows as an
/// "outline" above/below the handle within the on-screen strip.
fn needs_resize(edge: &Edge) -> bool {
    #[cfg(target_os = "macos")]
    { matches!(edge, Edge::Top | Edge::Bottom) }
    #[cfg(target_os = "windows")]
    { let _ = edge; true }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    { let _ = edge; false }
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

            if needs_resize(&cfg.edge) {
                // Resize approach: hidden = handle only, shown = full window
                let (hidden_x, shown_x) = match cfg.edge {
                    Edge::Right => (area.x + area.w - thickness, area.x + area.w - w),
                    Edge::Left => (area.x, area.x),
                    _ => unreachable!(),
                };
                // For hidden state, align using handle length instead of panel height
                let hidden_align_y = area.y + match cfg.alignment {
                    Alignment::Start => 0.0,
                    Alignment::Center => (area.h - length) / 2.0,
                    Alignment::End => area.h - length,
                };
                Geometry { w, h, hidden_w: thickness, hidden_h: length, hidden_x, hidden_y: hidden_align_y, shown_x, shown_y: align_y }
            } else {
                // Position-only approach (macOS left/right): full size, slide on/off screen
                let (hidden_x, shown_x) = match cfg.edge {
                    Edge::Right => (area.x + area.w - thickness, area.x + area.w - w),
                    Edge::Left => (area.x - panel_w, area.x),
                    _ => unreachable!(),
                };
                Geometry { w, h, hidden_w: w, hidden_h: h, hidden_x, hidden_y: align_y, shown_x, shown_y: align_y }
            }
        }
        Edge::Top | Edge::Bottom => {
            let w = panel_w.max(length);
            let h = thickness + panel_h;

            // Use the same center point for both hidden and shown states
            // so the window expands/contracts symmetrically
            let center_x = area.x + match cfg.alignment {
                Alignment::Start => w / 2.0,
                Alignment::Center => area.w / 2.0,
                Alignment::End => area.w - w / 2.0,
            };

            let shown_x = center_x - w / 2.0;
            let hidden_x = center_x - length / 2.0;

            let (hidden_y, shown_y, hidden_w, hidden_h) = match cfg.edge {
                Edge::Top => (area.y, area.y, length, thickness),
                Edge::Bottom => (area.y + area.h - thickness, area.y + area.h - h, length, thickness),
                _ => unreachable!(),
            };

            Geometry { w, h, hidden_w, hidden_h, hidden_x, hidden_y, shown_x, shown_y }
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

    let resize = needs_resize(&cfg.edge);

    let (start_x, start_y, end_x, end_y) = if visible {
        (geo.hidden_x, geo.hidden_y, geo.shown_x, geo.shown_y)
    } else {
        (geo.shown_x, geo.shown_y, geo.hidden_x, geo.hidden_y)
    };

    let (start_w, start_h, end_w, end_h) = if resize {
        if visible {
            (geo.hidden_w, geo.hidden_h, geo.w, geo.h)
        } else {
            (geo.w, geo.h, geo.hidden_w, geo.hidden_h)
        }
    } else {
        (geo.w, geo.h, geo.w, geo.h)
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
        if resize {
            window.set_size(tauri::LogicalSize::new(end_w, end_h)).map_err(|e| e.to_string())?;
        }
        window.set_position(tauri::LogicalPosition::new(end_x, end_y)).map_err(|e| e.to_string())?;
    } else {
        let steps = (duration / 16).max(1) as usize;
        let step_ms = duration as f64 / steps as f64;

        for i in 1..=steps {
            let t = i as f64 / steps as f64;
            let eased = ease_out_cubic(t);

            let x = start_x + (end_x - start_x) * eased;
            let y = start_y + (end_y - start_y) * eased;

            if resize {
                let w = start_w + (end_w - start_w) * eased;
                let h = start_h + (end_h - start_h) * eased;
                window.set_size(tauri::LogicalSize::new(w, h)).map_err(|e| e.to_string())?;
            }
            window.set_position(tauri::LogicalPosition::new(x, y)).map_err(|e| e.to_string())?;
            tokio::time::sleep(std::time::Duration::from_millis(step_ms as u64)).await;
        }

        // Ensure exact final state
        if resize {
            window.set_size(tauri::LogicalSize::new(end_w, end_h)).map_err(|e| e.to_string())?;
        }
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

    // Set size and position at hidden state
    window.set_size(tauri::LogicalSize::new(geo.hidden_w, geo.hidden_h)).map_err(|e| e.to_string())?;
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
    window.set_size(tauri::LogicalSize::new(geo.hidden_w, geo.hidden_h)).map_err(|e| e.to_string())?;
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

    window.set_size(tauri::LogicalSize::new(geo.hidden_w, geo.hidden_h)).map_err(|e| e.to_string())?;
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
