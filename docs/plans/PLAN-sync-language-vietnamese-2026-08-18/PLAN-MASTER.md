---
task: sync-language-vietnamese
created: 2026-08-18
updated: 2026-08-18
status: done
workflow: WF-REFACTOR
priority: P2
---

# PLAN MASTER: Đồng bộ hóa Ngôn ngữ Toàn bộ Dự án sang Tiếng Việt Chuẩn KZTEK

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mục tiêu
Đồng bộ hóa 100% ngôn ngữ giao diện (UI), nhãn trạng thái (Status labels), độ ưu tiên (Priority), loại công việc (Task types), các trường nhập liệu, nút bấm hành động, thông báo thông tin và lỗi trên toàn bộ hệ thống KZTEK Work Management sang Tiếng Việt chuẩn doanh nghiệp.

### Bảng Từ Điển Thuật Ngữ Chuẩn (KZTEK Glossary):
| Thuật ngữ gốc | Tiếng Việt chuẩn | Ghi chú |
|---|---|---|
| Backlog | Tồn đọng (Backlog) | Giữ kèm chữ Backlog cho quen thuộc Scrum |
| To do / TODO | Cần làm | Trạng thái công việc |
| In progress | Đang thực hiện | Trạng thái công việc |
| In review | Đang xét duyệt | Trạng thái công việc |
| Done | Hoàn thành | Trạng thái công việc |
| Urgent | Khẩn cấp | Độ ưu tiên |
| High | Cao | Độ ưu tiên |
| Medium | Trung bình | Độ ưu tiên |
| Low | Thấp | Độ ưu tiên |
| Task | Công việc (Task) | Loại task |
| Story | Tính năng (Story) | Loại task |
| Bug | Lỗi (Bug) | Loại task |
| Epic | Hạng mục lớn (Epic) | Loại task |
| Story Points | Điểm ước lượng (Story Points) | Định lượng khối lượng công việc |
| Due Date | Hạn chót hoàn thành | Thời hạn |
| Assignee | Người phụ trách | Nhân sự |
| Subtasks / Checklist | Việc con / Checklist | Danh mục kiểm tra |
| Attachments | Tệp đính kèm | Tài liệu / hình ảnh |
| Comments | Bình luận & Thảo luận | Trao đổi |
| Activity / History | Lịch sử hoạt động | Nhật ký |
| Burndown / Velocity | Biểu đồ Burndown / Tốc độ phát triển | Báo cáo sprint |

## Phân công thực hiện (Chain of Command)

| Phase | Bước | Agent | Nội dung | Status | Step file |
|---|---|---|---|---|---|
| Phase 1 | 1.1 | Tech Lead | Chuẩn hóa bảng thuật ngữ (Glossary) & Kiến trúc hằng số `constants.ts` | ✅ | `steps/STEP-1.1-tech-spec.md` |
| Phase 2 | 2.1 | Senior Developer | Cập nhật hằng số cốt lõi `constants.ts`, Mail templates, AI helpers & APIs | ✅ | `steps/STEP-2.1-core-constants.md` |
| Phase 2 | 2.2 | Junior Developer | Đồng bộ hóa toàn bộ UI Components, Modals, Dialogs, Pages | ✅ | `steps/STEP-2.2-ui-components.md` |
| Phase 3 | 3.1 | UX/UI Reviewer | Rà soát 7 tiêu chí trực quan C1–C7, tính nhất quán ngữ nghĩa | ✅ | `steps/STEP-3.1-ux-review.md` |
| Phase 3 | 3.2 | QA Engineer | Chạy lại bộ kiểm thử tự động, xác nhận không gãy logic | ✅ | `steps/STEP-3.2-qa-verify.md` |
| Phase 3 | 3.3 | QA Lead | Đánh giá & Phê duyệt Sign-Off | ✅ | `steps/STEP-3.3-signoff.md` |

## Artifacts theo dõi
- `src/lib/constants.ts`
- `src/components/board/task-dialog.tsx`
- `src/components/board/new-task-dialog.tsx`
- `src/components/board/task-card.tsx`
- `src/components/sprint/sprint-detail-dialog.tsx`
- `src/components/tickets/ticket-drawer.tsx`
- `src/components/tickets/ticket-list-view.tsx`
- `src/app/projects/[projectId]/dashboard/page.tsx`
- `src/app/projects/[projectId]/reports/page.tsx`
- `src/app/portal/page.tsx`
