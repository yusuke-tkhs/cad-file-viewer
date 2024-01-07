// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


// Read local file as bytes
#[tauri::command]
fn read_file_as_bytes(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(&path).map_err(|e| e.to_string())
}

// write
// #[tauri::command]
// fn write(bytes: Vec<u8>) -> Result<(), String> {
//     std::fs::write("debug.glb", bytes).map_err(|e| e.to_string())
// }

fn main() {
    
    // here `"quit".to_string()` defines the menu item id, and the second parameter is the menu item label.
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_file_as_bytes])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
