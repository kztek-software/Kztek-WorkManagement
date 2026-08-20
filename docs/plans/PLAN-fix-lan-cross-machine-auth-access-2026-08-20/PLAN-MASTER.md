---
task: fix-lan-cross-machine-auth-access
created: 2026-08-20
updated: 2026-08-20
status: done
workflow: WF-BUGFIX
priority: P1
---

# PLAN MASTER: Sửa Lỗi Máy Khác Trong Mạng LAN Không Dùng Được Sau Khi Đăng Nhập

## 1. Mô tả sự cố & Yêu cầu
- **Hiện tượng**: Khi truy cập từ máy tính khác trong mạng nội bộ (LAN / Wi-Fi) qua địa chỉ IP (ví dụ: `http://192.168.x.x:3000`), người dùng điền thông tin hoặc bấm Đăng nhập nhanh 1-Click thì API trả về thành công, nhưng sau đó trang bị lặp lại về màn hình Đăng nhập hoặc các trang chức năng (Board, Dashboard, Projects) bị báo lỗi 401 Unauthorized và không tải được dữ liệu.
- **Yêu cầu**: Khắc phục triệt để để mọi máy tính trong mạng LAN đều có thể đăng nhập và sử dụng toàn bộ chức năng (Dashboard, Kanban Board, Sprints, Báo cáo, Phân quyền) ổn định.

## 2. Root Cause Analysis
1. **Cookie bị cờ `Secure: true` trên kết nối HTTP LAN**:
   - `src/lib/auth.ts`: `createSession()` gán `secure: process.env.NODE_ENV === "production"`.
   - Khi chạy ở chế độ production (`next start` hoặc `KZTEK-Work.cmd`), cờ này bật `true`.
   - Máy chủ `localhost` là Secure Context nên nhận cookie, nhưng máy khác kết nối qua HTTP IP (`http://192.168.x.x:3000`) bị trình duyệt (Chrome, Edge, Safari, Firefox) tự động drop/reject cookie theo chuẩn RFC 6265bis.
   - Khi chuyển trang, trình duyệt không gửi kèm cookie `flowboard_session`, khiến `getSessionUser()` trả về `null` và redirect về `/login`.
2. **Next.js `allowedDevOrigins`**:
   - `next.config.ts` giới hạn một số IP tĩnh, cần mở rộng pattern cho toàn bộ dải mạng LAN (`192.168.*`, `10.*`, `172.*`).
3. **Host Binding**:
   - `KZTEK-Work.cmd` và `package.json` cần gắn cờ `-H 0.0.0.0` tường minh khi khởi chạy.

## 3. Workflow: WF-BUGFIX (P1)
1. **QA Engineer / Senior Dev**: Triage & Root cause analysis
2. **Senior Developer**: Sửa `src/lib/auth.ts`, các API auth route, `next.config.ts`, `KZTEK-Work.cmd`, `package.json`
3. **Tech Lead**: Code review & kiểm tra bảo mật
4. **QA Engineer**: Xác minh hoạt động của cookie và các API
5. **DevOps Engineer**: Cập nhật kịch bản chạy máy chủ & Release

## 4. Steps
| # | Bước | Agent | Status | Hoàn thành lúc |
|---|------|-------|--------|-----------------|
| 1.1 | Triage & Phân tích Root Cause chi tiết | QA Engineer / Senior Dev | ✅ | 2026-08-20 15:02 |
| 1.2 | Sửa cấu hình Cookie LAN, Auth Routes, Allowed Origins & Host Binding | Senior Developer | ✅ | 2026-08-20 15:03 |
| 1.3 | Code review & Kiểm tra bảo mật | Tech Lead | ✅ | 2026-08-20 15:05 |
| 1.4 | Verification & Test kịch bản mạng LAN | QA Engineer | ✅ | 2026-08-20 15:05 |
| 1.5 | Release & Cập nhật kịch bản triển khai | DevOps Engineer | ✅ | 2026-08-20 15:05 |
