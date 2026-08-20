---
task: comprehensive-ui-logic-audit
created: 2026-08-18
updated: 2026-08-18
status: done
workflow: WF-BUGFIX
priority: P1
---

# PLAN MASTER: Rà soát & Kiểm tra lỗi UI, Lỗi Logic toàn bộ dự án KZTEK Work Management

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mục tiêu
Thực hiện đợt rà soát tổng thể (Comprehensive Audit) toàn bộ dự án KZTEK Work Management trên cả 2 khía cạnh:
1. **Lỗi Logic & Dữ liệu**:
   - Xác thực phân quyền (RBAC / Custom Roles / Permission server check).
   - Đồng bộ trạng thái Kanban & Sprints (Dnd-kit drag-and-drop, Story Points, Task position recalculation).
   - Quản lý Customer Tickets (Triage, Convert to Task, Internal Comments vs Customer Comments).
   - Hệ thống Notify & Email Service (Event triggers, Mail templates, SMTP failover / Simulated Outbox, Unread notifications counter).
   - Upload & File Attachments (MIME types, File size validation, Task/Ticket association).
   - API error handling, null safety, missing fields và edge cases.

2. **Lỗi UI & Trải nghiệm (UX/UI Review)**:
   - Layout consistency & Branding KZTEK (#251C53 Tím than, #F05922 Cam, #6366F1 Accent).
   - Responsive & Co giãn màn hình (Mobile, Tablet, Desktop, Sidebar collapse).
   - Modals, Dialogs, Dropdowns z-index và overflow issues.
   - Trạng thái Loading, Empty state, Error alerts, Toast notifications.
   - Accessibility, font contrast, nút bấm hover / active / disabled states.

## Phân công thực hiện (Chain of Command)

| Phase | Bước | Agent | Nội dung | Status | Step file |
|---|---|---|---|---|---|
| Phase 1 | 1.1 | QA Engineer | Chạy Automated Tests, Static Scan, Rà soát toàn bộ API endpoints & Logic DB | ✅ | `steps/STEP-1.1-logic-audit.md` |
| Phase 1 | 1.2 | UX/UI Reviewer | Rà soát toàn bộ Giao diện (7 tiêu chí C1–C7, Modals, Forms, Mobile responsiveness) | ✅ | `steps/STEP-1.2-ui-audit.md` |
| Phase 2 | 2.1 | Tech Lead | Tổng hợp danh sách lỗi, phân loại P0/P1/P2/P3, duyệt phương án khắc phục | ✅ | `steps/STEP-2.1-triage-and-plan.md` |
| Phase 2 | 2.2 | Senior Developer | Khắc phục toàn bộ lỗi Logic, API, Validation & Edge Cases | ✅ | `steps/STEP-2.2-fix-logic-bugs.md` |
| Phase 2 | 2.3 | Junior Developer | Khắc phục toàn bộ lỗi UI/UX, CSS, Styling & Empty/Loading states | ✅ | `steps/STEP-2.3-fix-ui-bugs.md` |
| Phase 3 | 3.1 | QA Engineer | Re-test toàn diện (Regression Test, E2E flow test), xác nhận 0 lỗi tồn đọng | ✅ | `steps/STEP-3.1-qa-verification.md` |
| Phase 3 | 3.2 | QA Lead | Đánh giá chất lượng tổng thể & Sign-off hoàn thành | ✅ | `steps/STEP-3.2-signoff.md` |

## Artifacts theo dõi
- `scripts/test-comprehensive-audit.js`
- Các file source code được tối ưu/khắc phục
- `code-graph/CODE-GRAPH.md`
