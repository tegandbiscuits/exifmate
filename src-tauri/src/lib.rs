use serde::Serialize;
use std::thread;
use tauri::Emitter;
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    AppHandle,
};
use tauri_plugin_dialog::DialogExt;

const SUPPORTED: &[&str] = &["jpg", "jpeg"];

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DirectoryImage {
    filename: String,
    path: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DirectoryInfo {
    dir_path: String,
    image_list: Vec<DirectoryImage>,
}

fn find_images(app_handle: &AppHandle) {
    let new_handle = app_handle.clone();
    thread::spawn(move || {
        if let Some(path) = new_handle.dialog().file().blocking_pick_folder() {
            if let Some(dir) = path.as_path() {
                let files: Vec<_> = std::fs::read_dir(dir)
                    .ok()
                    .into_iter()
                    .flatten()
                    .filter_map(Result::ok)
                    .map(|e| e.path())
                    .filter(|p| {
                        p.is_file()
                            && p.extension()
                                .and_then(|ext| ext.to_str())
                                .map(|ext| SUPPORTED.contains(&ext.to_ascii_lowercase().as_str()))
                                .unwrap_or(false)
                    })
                    .collect();

                let image_list: Vec<DirectoryImage> = files
                    .iter()
                    .map(|f| DirectoryImage {
                        filename: f.file_name().unwrap().to_string_lossy().into_owned(),
                        path: f.to_string_lossy().into(),
                    })
                    .collect();
                let dir_info = DirectoryInfo {
                    dir_path: path.to_string(),
                    image_list: image_list,
                };

                new_handle.emit("find-images", dir_info).unwrap()
            }
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_menu = SubmenuBuilder::new(app, "exifmate")
                .hide()
                .hide_others()
                .show_all()
                .separator()
                .quit()
                .build()?;

            let open = MenuItemBuilder::new("Open")
                .id("open")
                .accelerator("CmdOrCtrl+o")
                .build(app)?;

            let file_menu = SubmenuBuilder::new(app, "File").item(&open).build()?;

            let menu = MenuBuilder::new(app)
                .items(&[&app_menu, &file_menu])
                .build()?;

            app.set_menu(menu)?;

            app.on_menu_event(move |app_handle: &tauri::AppHandle, event| {
                match event.id().0.as_str() {
                    "open" => {
                        println!("gonna open");
                        find_images(app_handle);
                    }
                    _ => {
                        println!("unexpected menu event");
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
