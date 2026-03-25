use tauri::{AppHandle, Emitter, Manager};

#[tauri::command]
pub async fn slide_window(app: AppHandle, visible: bool) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("Window not found")?;

    let monitor = window
        .current_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("No monitor found")?;

    let scale = monitor.scale_factor();
    let screen_w = monitor.size().width as f64 / scale;
    let screen_h = monitor.size().height as f64 / scale;

    let target_width: f64 = if visible { 420.0 } else { 30.0 };
    let panel_height: f64 = 700.0;

    let current_size = window.outer_size().map_err(|e| e.to_string())?;
    let current_width = current_size.width as f64 / scale;

    let steps = 12;
    let step_duration = std::time::Duration::from_millis(16);

    for i in 1..=steps {
        let t = i as f64 / steps as f64;
        let eased = ease_out_cubic(t);
        let w = current_width + (target_width - current_width) * eased;
        let x = screen_w - w;
        let y = (screen_h - panel_height) / 2.0;

        window
            .set_position(tauri::LogicalPosition::new(x, y))
            .map_err(|e| e.to_string())?;
        window
            .set_size(tauri::LogicalSize::new(w, panel_height))
            .map_err(|e| e.to_string())?;

        tokio::time::sleep(step_duration).await;
    }

    // Emit state change to frontend
    window.emit("slide-state", visible).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn position_window(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("Window not found")?;

    let monitor = window
        .current_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("No monitor found")?;

    let scale = monitor.scale_factor();
    let screen_w = monitor.size().width as f64 / scale;
    let screen_h = monitor.size().height as f64 / scale;

    let panel_height: f64 = 700.0;
    let tab_width: f64 = 30.0;

    let x = screen_w - tab_width;
    let y = (screen_h - panel_height) / 2.0;

    window
        .set_position(tauri::LogicalPosition::new(x, y))
        .map_err(|e| e.to_string())?;
    window
        .set_size(tauri::LogicalSize::new(tab_width, panel_height))
        .map_err(|e| e.to_string())?;

    window.show().map_err(|e| e.to_string())?;

    Ok(())
}

fn ease_out_cubic(t: f64) -> f64 {
    1.0 - (1.0 - t).powi(3)
}
