/**
 * preload.js
 * Context Bridge an toàn cho KZTEK Work Desktop Application
 */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("kztekDesktop", {
  isDesktopApp: true,
  platform: process.platform,
  version: "1.0.0",

  // Window Controls
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),

  // Native Notifications
  sendNotification: (title, body, icon) => {
    ipcRenderer.send("native-notification", { title, body, icon });
  },

  // Badge Counter
  setBadgeCount: (count) => {
    ipcRenderer.send("set-badge-count", count);
  },

  // Navigate to custom route inside app
  navigate: (route) => {
    ipcRenderer.send("navigate-route", route);
  },
});
