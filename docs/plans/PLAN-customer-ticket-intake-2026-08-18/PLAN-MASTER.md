---
task: customer-ticket-intake
created: 2026-08-18
updated: 2026-08-18
status: done
workflow: WF-FEATURE
priority: P1
---

# PLAN MASTER: Tính năng tiếp nhận Ticket & Báo lỗi từ khách hàng bên ngoài (Customer Ticket Intake)

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mô tả
Xây dựng hệ thống tiếp nhận báo lỗi / ticket từ khách hàng và đối tác bên ngoài (không cần tài khoản nội bộ):
1. **Public Customer Portal**: Form gửi báo lỗi trực quan (`/portal` hoặc `/portal/[projectKey]`) kèm mã tra cứu tự động (`TK-XXXXXX`), trang tra cứu tiến độ công khai (`/portal/tickets/[trackingCode]`) cho phép khách hàng theo dõi trạng thái và trao đổi thêm thông tin.
2. **Public API / Webhook**: Endpoint `/api/tickets/public` hỗ trợ tích hợp với hệ thống bên ngoài / form nhúng.
3. **Trung tâm quản lý Ticket nội bộ**: Trang quản lý ticket trong dự án (`/projects/[projectId]/tickets`) phân loại theo trạng thái (Mới, Đã tiếp nhận, Đang xử lý, Đã giải quyết, Đóng/Từ chối), lọc theo mức độ ưu tiên, xem chi tiết thông tin khách hàng & thiết bị môi trường.
4. **1-Click Convert to Task/Bug**: Chuyển đổi 1 chạm từ Ticket của khách hàng thành Task/Bug trực tiếp trên Kanban Board của dự án, tự động gán nhãn, liên kết và cập nhật trạng thái hai chiều.
5. **Real-time SSE Notification**: Thông báo thời gian thực khi có khách hàng gửi ticket mới.

## Nguồn yêu cầu
- Yêu cầu gốc: "Thêm chức năng nhận ticket từ bên ngoài, dành cho khách hàng báo lỗi"
- Workflow: WF-FEATURE — Tính năng mới
- Agent chain: PM → BA → UX → EM → TL → Senior Dev / Junior Dev → Tech Lead (Review) → UX/UI Reviewer → QA Engineer

## Phases & Steps

### Phase 1: Database Schema & Core Ticket API
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Thiết kế Prisma Schema: Model `CustomerTicket` & `TicketComment`, quan hệ với Project & Task | Senior Developer | ✅ | `steps/STEP-1.1-prisma-schema.md` | 2026-08-18 13:45 |
| 1.2 | Xây dựng REST API tiếp nhận ticket public, tra cứu tracking code, API quản lý nội bộ & SSE events | Senior Developer | ✅ | `steps/STEP-1.2-ticket-api.md` | 2026-08-18 13:46 |

### Phase 2: Public Customer Portal (Giao diện khách hàng)
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Xây dựng trang gửi báo lỗi công khai (`/portal` / `/portal/[projectKey]`) và trang tra cứu ticket (`/portal/tickets/[trackingCode]`) | Junior Developer | ✅ | `steps/STEP-2.1-customer-portal.md` | 2026-08-18 13:48 |

### Phase 3: Internal Ticket Management & Board Integration (Giao diện nội bộ)
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 3.1 | Xây dựng Trung tâm Quản lý Ticket trong dự án (`/projects/[projectId]/tickets`), menu Sidebar, bộ lọc và Drawer chi tiết ticket | Senior Developer | ✅ | `steps/STEP-3.1-internal-ticket-inbox.md` | 2026-08-18 13:50 |
| 3.2 | Tích hợp tính năng 1-Click Convert Ticket -> Task/Bug trên Kanban Board, đồng bộ trạng thái & gửi notification realtime | Senior Developer | ✅ | `steps/STEP-3.2-convert-to-task.md` | 2026-08-18 13:51 |

### Phase 4: Review, Kiểm thử & Hoàn thiện
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 4.1 | UX/UI Reviewer: Đánh giá trực quan giao diện Portal và Ticket Management theo tiêu chí C1–C7 | UX/UI Reviewer | ✅ | `steps/STEP-4.1-ux-review.md` | 2026-08-18 13:54 |
| 4.2 | QA Engineer: Kiểm thử luồng gửi ticket, tra cứu mã, convert sang task, permissions và realtime notification | QA Engineer | ✅ | `steps/STEP-4.2-qa-testing.md` | 2026-08-18 13:54 |

## Artifacts dự kiến (tổng)
- [x] `prisma/schema.prisma` (Thêm model `CustomerTicket`, `TicketComment`)
- [x] `src/lib/types.ts` (Bổ sung types cho Ticket, TicketComment, Tracking)
- [x] `src/lib/tickets.ts` (Module CRUD, tracking code, lọc bảo mật dữ liệu)
- [x] `src/app/api/tickets/public/route.ts` (API tiếp nhận ticket public)
- [x] `src/app/api/tickets/[code]/route.ts` (API tra cứu & cập nhật ticket theo mã)
- [x] `src/app/api/tickets/[code]/comments/route.ts` (API trao đổi bình luận)
- [x] `src/app/api/projects/[projectId]/tickets/route.ts` (API danh sách & tạo ticket nội bộ)
- [x] `src/app/api/projects/[projectId]/tickets/[ticketId]/route.ts` (API cập nhật/chi tiết ticket)
- [x] `src/app/api/projects/[projectId]/tickets/[ticketId]/convert/route.ts` (API convert ticket sang task/bug)
- [x] `src/app/portal/page.tsx` & `src/app/portal/[projectKey]/page.tsx` (Portal gửi ticket cho khách hàng)
- [x] `src/app/portal/tickets/[trackingCode]/page.tsx` (Trang tra cứu tiến độ ticket của khách)
- [x] `src/app/projects/[projectId]/tickets/page.tsx` (Trang quản lý ticket dự án)
- [x] `src/components/tickets/ticket-list-view.tsx` & `ticket-drawer.tsx`
- [x] `src/components/app-shell.tsx` (Thêm mục Hộp thư Ticket vào Sidebar)
- [x] `src/components/board/task-card.tsx` & `task-dialog.tsx` (Badge & liên kết Kanban)
- [x] `scripts/test-tickets-e2e.js` (Script test tự động E2E)

## Blockers
Không có

## Quyết định / Ghi chú tổng
- Public portal không yêu cầu đăng nhập, bảo vệ bằng mã tracking duy nhất và lọc bỏ toàn bộ ghi chú nội bộ.
- Trực tiếp tương thích với hệ thống Kanban hiện có: khi chuyển đổi thành Task, tự động gán loại `BUG` và gắn nhãn `Báo lỗi KH`.

## Lịch sử cập nhật
| Ngày | Cập nhật | Agent |
|------|----------|-------|
| 2026-08-18 | Tạo plan mới cho tính năng tiếp nhận Ticket bên ngoài | task-planner |
| 2026-08-18 | Hoàn tất Phase 1, Phase 2, Phase 3, Phase 4 | Dispatcher |

