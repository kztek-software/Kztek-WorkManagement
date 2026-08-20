---
task: native-desktop-app-zalo-style
created: 2026-08-18
updated: 2026-08-18
status: completed
workflow: WF-FEATURE
priority: P1
---

# PLAN MASTER: Xây Dựng Ứng Dụng Máy Tính Độc Lập Chuẩn Zalo PC (Native Desktop App)

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mục tiêu
Xây dựng ứng dụng máy tính bản địa độc lập (Native Desktop Standalone Application) giống như kiến trúc Zalo PC, Slack, Notion Desktop:
1. **Cửa Sổ Phần Mềm Độc Lập (Standalone App Window)**:
   - Chạy độc lập không thông qua giao diện trình duyệt web (không thanh URL, không tab trình duyệt).
   - Icon riêng biệt trên thanh Taskbar của Windows.
   - Hỗ trợ khởi động 1-click trực tiếp từ màn hình Desktop (`KZTEK Work Management.lnk` & `KZTEK-Work.cmd`).

2. **Khay Hệ Thống & Chạy Nền (System Tray - Giống Zalo PC)**:
   - Thu nhỏ xuống khay hệ thống (góc dưới bên phải cạnh đồng hồ Windows) khi đóng cửa sổ.
   - Menu chuột phải: Mở nhanh, Chế độ làm việc đa nhiệm, Khởi động cùng Windows, Thoát ứng dụng.

3. **Thông Báo Màn Hình Bản Địa (Native Desktop Notifications)**:
   - Bật thông báo Toast góc phải màn hình Windows khi có công việc mới hoặc ticket khẩn.

## Phân công thực hiện (Chain of Command)

| Phase | Bước | Agent | Nội dung | Status | Step file |
|---|---|---|---|---|---|
| Phase 1 | 1.1 | Product Manager & BA | Phân tích PRD & Đặc tả nghiệp vụ Ứng dụng Desktop Độc Lập chuẩn Zalo PC | ✅ | `steps/STEP-1.1-prd-native-desktop-app.md` |
| Phase 1 | 1.2 | UI/UX Designer & Tech Lead | Thiết kế kiến trúc Native Desktop Window, System Tray & Launcher Spec | ✅ | `steps/STEP-1.2-ux-ui-native-desktop-spec.md` |
| Phase 2 | 2.1 | Senior Developer | Xây dựng Desktop Main Process & Electron/WebView2 Bridge (`desktop/main.js`, `preload.js`) | ✅ | `steps/STEP-2.1-desktop-main-process.md` |
| Phase 2 | 2.2 | Senior Developer | Xây dựng System Tray Manager & Windows Native Notification Bridge | ✅ | `steps/STEP-2.2-system-tray-notifications.md` |
| Phase 2 | 2.3 | Junior Developer | Xây dựng Windows 1-Click Launcher (`KZTEK-Work.cmd`) & Script tạo Desktop Shortcut | ✅ | `steps/STEP-2.3-windows-launcher-shortcut.md` |
| Phase 2 | 2.4 | Junior Developer | Tích hợp Native Notification Bridge vào Web Client | ✅ | `steps/STEP-2.4-client-notification-integration.md` |
| Phase 3 | 3.1 | UX/UI Reviewer | Đánh giá trải nghiệm Cửa sổ độc lập, System Tray & Icon Taskbar theo 7 tiêu chí C1–C7 | ✅ | `steps/STEP-3.1-ux-ui-review-desktop-app.md` |
| Phase 3 | 3.2 | QA Engineer & QA Lead | Chạy kiểm thử tự động toàn diện `test-native-desktop-e2e.js`, kiểm tra 1-click launcher & Ký duyệt nghiệm thu | ✅ | `steps/STEP-3.2-qa-verification-signoff.md` |

## Artifacts theo dõi
- `desktop/main.js` (Main Process Window & Tray)
- `desktop/preload.js` (Preload Context Bridge)
- `desktop/tray-manager.js` (System Tray Handler)
- `KZTEK-Work.cmd` (1-Click Windows Native Launcher)
- `scripts/create-desktop-shortcut.ps1` (Desktop Shortcut Generator)
- `src/components/desktop/native-notification-bridge.tsx` (Notification Bridge)
- `scripts/test-native-desktop-e2e.js` (Verification Script - 21/21 PASS)
- `code-graph/CODE-GRAPH.md`
