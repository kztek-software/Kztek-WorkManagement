# STEP-1.2: Thiết Kế Kiến Trúc Cửa Sổ Độc Lập, Khay Hệ Thống & Trình Khởi Động

## 1. Bản Vẽ Cửa Sổ Ứng Dụng Bản Địa (Native Standalone Window)

### 1.1 Khung Cửa Sổ Chuẩn Zalo PC / Slack
- **Kích thước ban đầu**: Width $1440px$, Height $900px$, Min-width $1024px$, Min-height $700px$.
- **Window Framing**:
  - Tích hợp cửa sổ bản địa sạch sẽ, không có bất kỳ thanh điều hướng (URL Bar, Bookmarks, Extension icons) của trình duyệt.
  - Phù hợp trên mọi kích thước màn hình PC/Laptop (từ màn hình 14 inch Full HD đến màn hình Ultrawide 34 inch).

### 1.2 Thiết Kế Khay Hệ Thống (System Tray)
- **Icon**: `Kztek_Logo.png` thu nhỏ độ phân giải $32 \times 32$ và $16 \times 16$.
- **Hành vi (Tray Interaction Flow)**:
  ```
  User Click (X) Close Window
           │
           ▼
  ┌────────────────────────────────────────────────┐
  │ Ứng dụng ẩn cửa sổ và chạy nền dưới Khay Taskbar │
  │ Hiện thông báo nhỏ: "KZTEK Work đang chạy nền" │
  └────────────────────────────────────────────────┘
           │
  ┌────────┴────────┐
  ▼                 ▼
  Double Click        Right Click
  Mở lại cửa sổ       Hiện Menu Tác Vụ Nhanh (Zalo style)
  ```

---

## 2. Kiến Trúc Kỹ Thuật (Architecture & Components)

```
kztek-work-management/
├── desktop/                         ← Native Desktop Application Layer
│   ├── main.js                      ← Main Process (BrowserWindow, Tray, Notifications, Auto-launch)
│   ├── preload.js                   ← Security Preload Context Bridge
│   ├── tray-manager.js              ← System Tray Controller & Context Menu
│   └── package.json                 ← Desktop package descriptor
├── KZTEK-Work.cmd                   ← Windows 1-Click Native Launcher (mở thẳng App không qua trình duyệt)
├── scripts/
│   ├── create-desktop-shortcut.ps1  ← Script tạo icon KZTEK Work Management trên Desktop
│   └── test-native-desktop-e2e.js   ← Kịch bản kiểm thử tự động
└── src/components/desktop/
    └── native-notification-bridge.tsx ← Cầu nối Desktop Push Notification
```

---

## 3. Handoff Log
- **Người bàn giao**: UI/UX Designer & Tech Lead (L4/L3)
- **Người nhận bàn giao**: Senior Developer (L4)
- **Nội dung bàn giao**: Bản thiết kế kiến trúc Desktop Client và luồng System Tray.
