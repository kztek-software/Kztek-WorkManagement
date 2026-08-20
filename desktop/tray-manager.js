/**
 * tray-manager.js
 * Quản lý Icon Khay Hệ Thống (System Tray) Chuẩn Zalo PC
 */

const { Tray, Menu, app, nativeImage } = require("electron");
const path = require("path");

class TrayManager {
  constructor(mainWindow, serverUrl) {
    this.mainWindow = mainWindow;
    this.serverUrl = serverUrl;
    this.tray = null;
    this.initTray();
  }

  initTray() {
    const iconPath = path.join(__dirname, "..", "public", "kztek-custom.png");
    let icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      const fallbackPath = path.join(__dirname, "..", "Kztek_Logo.png");
      icon = nativeImage.createFromPath(fallbackPath);
    }
    // Resize for Windows Tray (16x16 or 32x32)
    icon = icon.resize({ width: 16, height: 16 });

    this.tray = new Tray(icon);
    this.tray.setToolTip("KZTEK Work Management — Nền tảng Điều hành Doanh nghiệp");

    // Double click to restore window (giống hệt Zalo)
    this.tray.on("double-click", () => {
      this.showMainWindow();
    });

    this.updateContextMenu();
  }

  updateContextMenu() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "🏢 Mở KZTEK Work",
        click: () => this.showMainWindow(),
      },
      {
        label: "🖥️ Chế độ Máy tính Đa nhiệm (/desktop)",
        click: () => {
          this.showMainWindow();
          if (this.mainWindow) {
            this.mainWindow.loadURL(`${this.serverUrl}/desktop`);
          }
        },
      },
      {
        label: "🎫 Hộp Thư Báo Lỗi Khách Hàng",
        click: () => {
          this.showMainWindow();
          if (this.mainWindow) {
            this.mainWindow.loadURL(`${this.serverUrl}/portal`);
          }
        },
      },
      { type: "separator" },
      {
        label: "🚀 Khởi động cùng Windows",
        type: "checkbox",
        checked: app.getLoginItemSettings().openAtLogin,
        click: (item) => {
          app.setLoginItemSettings({
            openAtLogin: item.checked,
            openAsHidden: true,
          });
        },
      },
      {
        label: "ℹ️ Giới thiệu KZTEK Work (v2.4)",
        click: () => {
          this.showMainWindow();
        },
      },
      { type: "separator" },
      {
        label: "❌ Thoát hoàn toàn",
        click: () => {
          app.isQuiting = true;
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  showMainWindow() {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) this.mainWindow.restore();
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  destroy() {
    if (this.tray) {
      this.tray.destroy();
    }
  }
}

module.exports = TrayManager;
