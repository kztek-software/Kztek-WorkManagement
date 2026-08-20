---
task: customer-ticket-admin-dispatch
created: 2026-08-18
updated: 2026-08-18
status: done
workflow: WF-FEATURE
priority: P1
---

# PLAN MASTER: Sửa lỗi Upload File & Quy trình Khách hàng không chọn Dự án -> Gửi Thông báo Admin -> Admin Điều phối Dự án

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mô tả
1. **Sửa lỗi không đẩy được file (File Upload Fix)**:
   - Sửa `src/app/api/upload/route.ts` để cho phép khách hàng chưa đăng nhập trên Public Portal tải lên file/ảnh/video lỗi.
   - Hỗ trợ cả key `"file"` và `"files"` trong FormData, validate kích thước và định dạng tệp tin.
2. **Ẩn thông tin Dự án khỏi Khách hàng (Data Privacy)**:
   - Khách hàng không cần và không được phép biết thông tin dự án/mã dự án nội bộ.
   - Loại bỏ hoàn toàn dropdown/bộ chọn dự án trên Public Customer Portal (`/portal`).
3. **Thông báo Admin & Điều phối Dự án (Admin Notification & Dispatch)**:
   - Khi khách hàng gửi báo lỗi, hệ thống tự động lưu ticket ở trạng thái chờ điều phối (`projectId: null` hoặc unassigned).
   - Tự động gửi thông báo (in-app & email) tới toàn bộ người dùng có quyền **ADMIN**.
   - Admin mở Hộp thư Ticket ➔ Chọn dự án đích từ danh sách ➔ Bấm **"Điều phối tới dự án"** ➔ Ticket được gán vào dự án đó, chuyển sang `TRIAGED`, thông báo cho thành viên dự án và sẵn sàng chuyển đổi thành Kanban Task.

## Phases & Steps

### Phase 1: File Upload Fix & Database Schema Update
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Sửa API `POST /api/upload` cho phép public upload & nhận cả "file"/"files" | Senior Developer | ✅ | `steps/STEP-1.1-upload-fix.md` | 2026-08-18 16:44 |
| 1.2 | Migration schema `CustomerTicket.projectId` sang nullable & cập nhật `types.ts` | Senior Developer | ✅ | `steps/STEP-1.2-schema-nullable-project.md` | 2026-08-18 16:45 |

### Phase 2: Public Portal Revamp & Admin Notification
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Gỡ bỏ chọn dự án trên Portal & gửi thông báo tự động tới tất cả Admin | Junior Developer | ✅ | `steps/STEP-2.1-portal-revamp-admin-notify.md` | 2026-08-18 16:46 |

### Phase 3: Admin Dispatch UI & API
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 3.1 | Xây dựng API Điều phối Ticket tới Dự án (`PATCH /api/tickets/[ticketId]/dispatch`) | Senior Developer | ✅ | `steps/STEP-3.1-dispatch-api.md` | 2026-08-18 16:46 |
| 3.2 | Tích hợp giao diện Điều phối Dự án trong `TicketDrawer` và `TicketListView` | Senior Developer | ✅ | `steps/STEP-3.2-dispatch-ui.md` | 2026-08-18 16:48 |

### Phase 4: Verification & Kiểm thử E2E
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 4.1 | Kiểm thử tự động E2E luồng Upload public -> Báo lỗi -> Báo Admin -> Điều phối -> Convert Task | QA Engineer | ✅ | `steps/STEP-4.1-verification.md` | 2026-08-18 16:49 |

## Artifacts dự kiến (tổng)
- [x] `src/app/api/upload/route.ts`
- [x] `prisma/schema.prisma` & `scripts/migrate-nullable-project-ticket.js`
- [x] `src/lib/types.ts`
- [x] `src/lib/tickets.ts`
- [x] `src/app/api/tickets/public/route.ts`
- [x] `src/app/api/tickets/[ticketId]/dispatch/route.ts`
- [x] `src/app/api/tickets/[ticketId]/route.ts`
- [x] `src/app/portal/page.tsx`
- [x] `src/components/tickets/ticket-drawer.tsx`
- [x] `src/components/tickets/ticket-list-view.tsx`
- [x] `scripts/test-admin-dispatch-e2e.js`

