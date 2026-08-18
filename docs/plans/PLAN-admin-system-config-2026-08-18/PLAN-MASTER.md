---
task: admin-system-config-and-top-right-header
created: 2026-08-18
updated: 2026-08-18
status: done
workflow: WF-FEATURE
priority: P1
---

# PLAN MASTER: Cấu hình Hệ thống cho Quản trị viên (Admin Config) & Chuyển thông tin tài khoản lên góc trên phải

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mô tả
1. **Chuyển thông tin tài khoản lên góc trên phải (Top-Right Header Bar)**:
   - Xây dựng thanh Header điều hướng phía trên trang với Breadcrumbs, nút Cấu hình hệ thống (Admin), Chuông thông báo (NotificationBell) và Menu Tài khoản người dùng (Avatar, Tên, Role badge ADMIN, Dropdown thông tin & Đăng xuất).
   - Xóa bỏ phần tài khoản chật chội ở chân Sidebar bên dưới để tránh bị che bởi các thông báo/toasts.
2. **Mục Cấu hình Hệ thống (Admin System Configuration)**:
   - Tạo trang `/projects/[projectId]/settings` và menu "Cấu hình Hệ Thống" trong sidebar dành riêng cho Quản trị viên (`role === "ADMIN"`).
   - Chặn quyền và bảo vệ nghiêm ngặt: Người dùng không phải ADMIN sẽ bị từ chối truy cập (Access Denied).
   - 4 phân hệ cấu hình trực quan:
     - **Cấu hình Máy chủ Email (SMTP Settings)**: Host, Port, User, Password, SSL/TLS, From Address, From Name, nút "Kiểm tra kết nối SMTP" và "Lưu cấu hình".
     - **Cấu hình Thương hiệu (Branding & Organization)**: Tên hệ thống, Công ty, Hotline, Website, Email hỗ trợ.
     - **Quy tắc Thông báo (Notification Rules)**: Bật/tắt email giao việc, đổi trạng thái, bình luận, realtime SSE.
     - **Thông tin Hệ thống & Chẩn đoán (System Status & Diagnostics)**.

## Nguồn yêu cầu
- Yêu cầu gốc: "làm thêm 1 mục config hệ thống chỉ có admin mới xem và cấu hình được; để phần thông tin tài khoản lên góc trên phải"
- Workflow: WF-FEATURE — Tính năng mới
- Agent chain: PM → BA → UI/UX → Tech Lead → Senior Developer → Junior Developer → QA Engineer

## Phases & Steps

### Phase 1: Kiến trúc Lưu trữ Cấu hình & APIs
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Xây dựng module `src/lib/system-config.ts` lưu trữ cấu hình hệ thống & tích hợp với `src/lib/mail.ts` | Senior Developer | ✅ | `steps/STEP-1.1-config-lib.md` | 2026-08-18 14:04 |
| 1.2 | Xây dựng API `/api/system/config` (GET, POST, TEST) bảo vệ phân quyền ADMIN chặt chẽ | Senior Developer | ✅ | `steps/STEP-1.2-config-api.md` | 2026-08-18 14:04 |

### Phase 2: Chuyển thông tin tài khoản lên góc trên phải (Top-Right Header)
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Thiết kế thanh Top-Right Header Bar và Dropdown Menu Tài khoản trong `src/components/app-shell.tsx` | Junior Developer | ✅ | `steps/STEP-2.1-top-right-header.md` | 2026-08-18 14:04 |

### Phase 3: Xây dựng Trang Cấu hình Hệ thống Quản trị viên
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 3.1 | Xây dựng trang `/projects/[projectId]/settings/page.tsx` với 4 tab cấu hình, kiểm tra SMTP và phân quyền ADMIN | Senior Developer | ✅ | `steps/STEP-3.1-admin-settings-page.md` | 2026-08-18 14:05 |

### Phase 4: Review & Verification
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 4.1 | Tech Lead Review & QA Verification: Kiểm thử phân quyền ADMIN, kiểm tra lưu cấu hình SMTP và giao diện Top Header | QA Engineer | ✅ | `steps/STEP-4.1-verification.md` | 2026-08-18 14:05 |

## Artifacts hoàn thành (tổng)
- [x] `src/lib/system-config.ts`
- [x] `src/app/api/system/config/route.ts`
- [x] `src/components/app-shell.tsx`
- [x] `src/app/projects/[projectId]/settings/page.tsx`
- [x] `src/lib/mail.ts`
- [x] `code-graph/CODE-GRAPH.md`

## Blockers
Không có
