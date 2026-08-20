/**
 * main.js
 * Main Process — KZTEK Work Management Native Desktop Application
 * Kiến trúc Standalone Window & System Tray chuẩn Zalo PC
 */

const { app, BrowserWindow, ipcMain, Notification, nativeImage, shell } = require("electron");
const path = require("path");
const TrayManager = require("./tray-manager");

const SERVER_URL = process.env.KZTEK_SERVER_URL || "http://localhost:3000";
let mainWindow = null;
let trayManager = null;

// Single Instance Lock: Đảm bảo chỉ chạy duy nhất 1 instance giống Zalo PC
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createMainWindow() {
  const iconPath = path.join(__dirname, "..", "public", "kztek-custom.png");

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "KZTEK Work Management",
    icon: iconPath,
    backgroundColor: "#181236",
    autoHideMenuBar: true, // Ẩn hoàn toàn menu trình duyệt
    show: false, // Hiện sau khi đã load xong để tránh nháy trắng
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Load URL
  mainWindow.loadURL(SERVER_URL);

  // Ready to show
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Mở các link ngoài bằng trình duyệt mặc định của hệ thống
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(SERVER_URL)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // Hành vi khi nhấn nút [X] đóng cửa sổ: Thu nhỏ xuống System Tray thay vì tắt hẳn (chuẩn Zalo PC)
  mainWindow.on("close", (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();

      // Hiển thị thông báo nhỏ nếu là lần đầu thu gọn
      if (Notification.isSupported() && !mainWindow.hasShownTrayTip) {
        mainWindow.hasShownTrayTip = true;
        new Notification({
          title: "KZTEK Work đang chạy nền",
          body: "Ứng dụng đã được thu nhỏ xuống Khay hệ thống góc phải màn hình để tiếp tục nhận thông báo.",
          icon: iconPath,
          silent: true,
        }).show();
      }
    }
    return false;
  });

  // Khởi tạo Tray Manager
  trayManager = new TrayManager(mainWindow, SERVER_URL);
}

// App Lifecycle
app.whenReady().then(() => {
  // Đặt App User Model ID cho Windows Taskbar & Notifications
  if (process.platform === "win32") {
    app.setAppUserModelId("net.kztek.workmanagement");
  }

  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

// Ngăn app thoát khi tất cả cửa sổ đóng (để giữ Tray chạy nền)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // Không thoát trên Windows/Linux, tiếp tục chạy dưới Tray
  }
});

// IPC Event Handlers
ipcMain.on("window-minimize", () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on("window-maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});

ipcMain.on("window-close", () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on("native-notification", (event, { title, body, icon }) => {
  if (Notification.isSupported()) {
    const iconPath = icon || path.join(__dirname, "..", "Kztek_Logo.png");
    new Notification({
      title: title || "KZTEK Work",
      body: body || "",
      icon: iconPath,
    }).show();
  }
});

ipcMain.on("set-badge-count", (event, count) => {
  if (app.setBadgeCount) {
    app.setBadgeCount(count);
  }
});

ipcMain.on("navigate-route", (event, route) => {
  if (mainWindow) {
    mainWindow.loadURL(`${SERVER_URL}${route.startsWith("/") ? route : `/${route}`}`);
  }
});
