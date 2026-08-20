/**
 * test-native-desktop-e2e.js
 * Kịch bản kiểm thử tự động toàn diện Ứng Dụng Máy Tính Độc Lập Chuẩn Zalo PC
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

console.log("================================================================================");
console.log("🧪 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG: NATIVE DESKTOP STANDALONE APP (ZALO STYLE)");
console.log("================================================================================");

// -----------------------------------------------------------------------------
// NHÓM 1: KIỂM TRA CẤU TRÚC DESKTOP APPLICATION LAYER (ELECTRON / NATIVE SHELL)
// -----------------------------------------------------------------------------
console.log("\n[Nhóm 1] Kiểm tra Desktop Application Layer & Core Processes:");

const mainJsPath = path.join(ROOT_DIR, "desktop", "main.js");
assert(fs.existsSync(mainJsPath), "File desktop/main.js tồn tại");

if (fs.existsSync(mainJsPath)) {
  const mainContent = fs.readFileSync(mainJsPath, "utf-8");
  assert(mainContent.includes("BrowserWindow"), "main.js khởi tạo BrowserWindow");
  assert(mainContent.includes("autoHideMenuBar: true"), "main.js ẩn thanh menu trình duyệt");
  assert(mainContent.includes("requestSingleInstanceLock"), "main.js có cơ chế Single Instance Lock giống Zalo");
  assert(mainContent.includes("event.preventDefault()"), "main.js chặn đóng cửa sổ để thu nhỏ xuống Tray");
  assert(mainContent.includes("ipcMain.on"), "main.js xử lý các IPC events");
}

const preloadJsPath = path.join(ROOT_DIR, "desktop", "preload.js");
assert(fs.existsSync(preloadJsPath), "File desktop/preload.js tồn tại");

if (fs.existsSync(preloadJsPath)) {
  const preloadContent = fs.readFileSync(preloadJsPath, "utf-8");
  assert(preloadContent.includes("contextBridge.exposeInMainWorld"), "preload.js phơi bày context bridge an toàn");
  assert(preloadContent.includes("kztekDesktop"), "preload.js đặt tên bridge là kztekDesktop");
}

const trayJsPath = path.join(ROOT_DIR, "desktop", "tray-manager.js");
assert(fs.existsSync(trayJsPath), "File desktop/tray-manager.js tồn tại");

if (fs.existsSync(trayJsPath)) {
  const trayContent = fs.readFileSync(trayJsPath, "utf-8");
  assert(trayContent.includes("new Tray"), "tray-manager.js khởi tạo Tray icon");
  assert(trayContent.includes("double-click"), "tray-manager.js xử lý sự kiện double-click");
  assert(trayContent.includes("Menu.buildFromTemplate"), "tray-manager.js tạo menu chuột phải");
}

// -----------------------------------------------------------------------------
// NHÓM 2: KIỂM TRA 1-CLICK LAUNCHER & SHORTCUT TRÊN DESKTOP WINDOWS
// -----------------------------------------------------------------------------
console.log("\n[Nhóm 2] Kiểm tra 1-Click Launcher & Windows Desktop Shortcut:");

const cmdPath = path.join(ROOT_DIR, "KZTEK-Work.cmd");
assert(fs.existsSync(cmdPath), "File KZTEK-Work.cmd tồn tại ở thư mục gốc");

if (fs.existsSync(cmdPath)) {
  const cmdContent = fs.readFileSync(cmdPath, "utf-8");
  assert(cmdContent.includes("--app="), "KZTEK-Work.cmd sử dụng cờ Native App Mode");
  assert(cmdContent.includes("SERVER_RUNNING"), "KZTEK-Work.cmd tự động kiểm tra và khởi động server nền");
}

// Kiểm tra file thực thi độc lập KZTEK-Work.exe
const exePath = path.join(ROOT_DIR, "KZTEK-Work.exe");
assert(fs.existsSync(exePath), "File thực thi nhị phân bản địa KZTEK-Work.exe tồn tại");
if (fs.existsSync(exePath)) {
  const stats = fs.statSync(exePath);
  assert(stats.size > 10000, `KZTEK-Work.exe có dung lượng hợp lệ (${Math.round(stats.size / 1024)} KB)`);
}

// Kiểm tra file shortcut trên Desktop của User
const userDesktop = path.join(process.env.USERPROFILE || "C:\\Users\\Flick", "Desktop");
const lnkPath = path.join(userDesktop, "KZTEK Work Management.lnk");
assert(fs.existsSync(lnkPath), `File Shortcut '${lnkPath}' đã được tạo thành công trên màn hình Desktop`);

// -----------------------------------------------------------------------------
// NHÓM 3: KIỂM TRA NATIVE NOTIFICATION BRIDGE & CLIENT INTEGRATION
// -----------------------------------------------------------------------------
console.log("\n[Nhóm 3] Kiểm tra Native Notification Bridge & Layout Integration:");

const bridgePath = path.join(ROOT_DIR, "src", "components", "desktop", "native-notification-bridge.tsx");
assert(fs.existsSync(bridgePath), "Component NativeNotificationBridge tồn tại");

if (fs.existsSync(bridgePath)) {
  const bridgeContent = fs.readFileSync(bridgePath, "utf-8");
  assert(bridgeContent.includes("sendDesktopNotification"), "Cung cấp hàm sendDesktopNotification");
  assert(bridgeContent.includes("kztek-notify"), "Lắng nghe custom event kztek-notify");
}

const layoutPath = path.join(ROOT_DIR, "src", "app", "layout.tsx");
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");
  assert(layoutContent.includes("NativeNotificationBridge"), "src/app/layout.tsx đã nhúng NativeNotificationBridge");
}

// -----------------------------------------------------------------------------
// TỔNG KẾT
// -----------------------------------------------------------------------------
console.log("\n================================================================================");
console.log(`📊 TỔNG KẾT KIỂM THỬ: ${passCount} PASSED / ${failCount} FAILED`);
console.log("================================================================================");

if (failCount === 0) {
  console.log("🎉 TẤT CẢ KỊCH BẢN KIỂM THỬ NATIVE DESKTOP APP ĐỀU ĐẠT CHUẨN XUẤT SẮC (100% PASS)!");
  process.exit(0);
} else {
  console.error("⚠️ CÓ LỖI XẢY RA TRONG QUÁ TRÌNH KIỂM THỬ!");
  process.exit(1);
}
