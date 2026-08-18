---
task: notify-service-email
created: 2026-08-18
updated: 2026-08-18
status: done
workflow: WF-FEATURE
priority: P1
---

# PLAN MASTER: Notify Service & Gửi thông báo Email khi giao việc

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mô tả
Xây dựng hệ thống Notification & Email Service chuyên nghiệp cho KZTEK Work Management:
1. **Email Service Engine (`src/lib/mail.ts`)**: Hỗ trợ gửi email qua SMTP chuẩn (Gmail, Microsoft 365, Custom SMTP) và chế độ Simulated Outbox (tự động kích hoạt khi chưa có cấu hình SMTP) với đầy đủ thông tin chi tiết.
2. **Branded HTML Email Templates**: Mẫu email chuẩn nhận diện thương hiệu KZTEK (#251C53 Tím than, #F05922 Cam) hiển thị đầy đủ thông tin công việc, người giao việc, độ ưu tiên, hạn chót và nút truy cập trực tiếp.
3. **Notify Service Centralization (`src/lib/notifications.ts`)**: Tự động kích hoạt thông báo đa kênh (In-app notification, SSE realtime event, Email) khi:
   - Giao việc mới hoặc đổi người phụ trách (Task Assignment)
   - Cập nhật trạng thái công việc (Status Changed)
   - Bình luận mới trong task (Task Comment)
   - Chuyển đổi Ticket khách hàng thành Task và giao việc
4. **Email Outbox & Test Email Center**: API & Modal giao diện xem lịch sử các email đã gửi, xem trước nội dung HTML và nút "Gửi thử nghiệm email".

## Nguồn yêu cầu
- Yêu cầu gốc: "Bổ sung notify service, gửi thông thông báo qua mail khi giao việc"
- Workflow: WF-FEATURE — Tính năng mới
- Agent chain: PM → BA → EM → Tech Lead → Senior Developer → Junior Developer → UX/UI Reviewer → QA Engineer

## Phases & Steps

### Phase 1: Core Email Engine & HTML Templates
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Xây dựng Email Service (`src/lib/mail.ts`) với SMTP Client, Outbox Log và Branded HTML Templates | Senior Developer | ✅ | `steps/STEP-1.1-email-service.md` | 2026-08-18 13:54 |
| 1.2 | Nâng cấp `src/lib/notifications.ts` tích hợp Notify Service đa kênh (In-app + Realtime SSE + Email) | Senior Developer | ✅ | `steps/STEP-1.2-notify-service.md` | 2026-08-18 13:54 |

### Phase 2: Tích hợp API & Event Triggers
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Tích hợp gửi email giao việc & cập nhật vào các Task APIs, Comment APIs & Ticket Convert API | Senior Developer | ✅ | `steps/STEP-2.1-api-integration.md` | 2026-08-18 13:55 |
| 2.2 | Xây dựng API `/api/notifications/email-logs` lấy lịch sử gửi email & gửi thử nghiệm SMTP | Senior Developer | ✅ | `steps/STEP-2.2-email-logs-api.md` | 2026-08-18 13:55 |

### Phase 3: Giao diện Email Logs & Notification Hub
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 3.1 | Xây dựng Modal "Lịch sử gửi Email & Gửi thử nghiệm" (`email-log-modal.tsx`) và tích hợp vào NotificationBell | Junior Developer | ✅ | `steps/STEP-3.1-email-modal-ui.md` | 2026-08-18 13:56 |

### Phase 4: Review & Verification
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 4.1 | Tech Lead Review & QA Verification: Kiểm thử toàn bộ luồng giao việc, gửi email và xem trước HTML | QA Engineer | ✅ | `steps/STEP-4.1-verification.md` | 2026-08-18 13:58 |

## Artifacts hoàn thành (tổng)
- [x] `src/lib/mail.ts`
- [x] `src/lib/notifications.ts`
- [x] `src/app/api/notifications/email-logs/route.ts`
- [x] `src/app/api/projects/[projectId]/tasks/route.ts`
- [x] `src/app/api/projects/[projectId]/tasks/[taskId]/route.ts`
- [x] `src/app/api/projects/[projectId]/tasks/[taskId]/comments/route.ts`
- [x] `src/app/api/projects/[projectId]/tickets/[ticketId]/convert/route.ts`
- [x] `src/components/notifications/email-log-modal.tsx`
- [x] `src/components/notifications/notification-bell.tsx`
- [x] `code-graph/CODE-GRAPH.md`

## Blockers
Không có
