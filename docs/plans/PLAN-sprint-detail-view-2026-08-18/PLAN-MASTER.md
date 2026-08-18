---
task: sprint-detail-view
created: 2026-08-18
updated: 2026-08-18
status: done
workflow: WF-FEATURE
priority: P2
---

# PLAN MASTER: Xem Chi Tiết Sprint & Quản Lý Công Việc Trong Sprint (Sprint Detail & Management Hub)

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mô tả
Xây dựng tính năng Xem Chi Tiết Sprint tương tác toàn diện cho trang **Kế hoạch Sprint** (`/projects/[projectId]/sprints`):
1. **Tương tác trực quan trên danh sách Sprint**:
   - Thẻ Sprint có trạng thái hover rõ nét, cho phép bấm trực tiếp vào thẻ hoặc nút "Chi tiết Sprint" để mở Modal/Inspector chi tiết.
2. **Trung tâm Chi tiết Sprint (Sprint Detail Hub)**:
   - **Header & Thông tin cốt lõi**: Tên Sprint, Trạng thái (Đang chạy, Lên kế hoạch, Hoàn thành), Mục tiêu (Goal) với chỉnh sửa nhanh, Thời gian bắt đầu/kết thúc và đếm ngược số ngày.
   - **Thanh tác vụ nhanh (Quick Actions)**:
     - Kích hoạt / Đóng hoàn thành / Mở lại Sprint.
     - Chỉnh sửa thông tin Sprint (Tên, Mục tiêu, Thời hạn).
     - Xóa Sprint (hoàn trả các task về Backlog an toàn).
     - Nút "Mở trên Board" (chuyển sang Board với bộ lọc theo Sprint này).
     - Nút "Thêm công việc vào Sprint" (tạo task mới hoặc gán nhanh từ Backlog).
   - **Thống kê & Chỉ số tiến độ (Metrics Overview)**:
     - Story Points hoàn thành / tổng số points, thanh tiến độ trực quan (Burn progress).
     - Phân bố trạng thái: Cần làm (TODO/BACKLOG), Đang làm (IN_PROGRESS/IN_REVIEW), Hoàn thành (DONE).
     - Phân bố theo Mức độ ưu tiên (Khẩn cấp, Cao, Trung bình, Thấp) và Loại công việc (Bug, Task, Story, Epic).
     - Phân bổ khối lượng công việc theo nhân sự (Team Member Workload).
   - **Danh sách công việc trong Sprint (Sprint Task List)**:
     - Bộ lọc theo nhóm trạng thái & ô tìm kiếm nhanh công việc trong Sprint.
     - Hiển thị đầy đủ thông tin: Mã task (`#FB-12`), Tiêu đề, Loại, Độ ưu tiên, Người phụ trách, Story points, Hạn chót, Trạng thái.
     - Hỗ trợ đổi trạng thái trực tiếp ngay trong bảng danh sách.
     - Bấm vào bất kỳ công việc nào mở ngay `TaskDialog` đầy đủ (xem checklist việc con, bình luận, mention @, đính kèm ảnh/video lỗi).
     - Nút gỡ task ra khỏi sprint (chuyển về Backlog).
   - **Dialog gán công việc từ Backlog vào Sprint (Add from Backlog)**:
     - Danh sách các công việc chưa gắn Sprint (hoặc thuộc Backlog) để chọn nhanh và gán hàng loạt vào Sprint.

## Nguồn yêu cầu
- Yêu cầu gốc: "Sprint: bấm vào có thể xem chi tiết"
- Workflow: WF-FEATURE — Tính năng mới
- Agent chain: PM → BA → EM → Tech Lead → Senior Developer → Junior Developer → UX/UI Reviewer → QA Engineer

## Phases & Steps

### Phase 1: Backend API Sprints Enhancement
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Bổ sung API DELETE và hoàn thiện cập nhật Sprint trong `/api/projects/[projectId]/sprints/[sprintId]` | Senior Developer | ✅ | `steps/STEP-1.1-sprint-api.md` | 2026-08-18 15:38 |

### Phase 2: Sprint Detail Dialog & Management Components
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Xây dựng component `SprintDetailDialog` với đầy đủ Dashboard chỉ số, danh sách task, đổi trạng thái nhanh, gỡ task và tích hợp `TaskDialog` | Senior Developer | ✅ | `steps/STEP-2.1-sprint-detail-dialog.md` | 2026-08-18 15:39 |
| 2.2 | Xây dựng dialog/tab chọn và gán nhanh công việc từ Backlog vào Sprint | Junior Developer | ✅ | `steps/STEP-2.2-add-backlog-tasks-dialog.md` | 2026-08-18 15:39 |
| 2.3 | Tích hợp sự kiện click mở Sprint Detail, hover effects và action buttons vào trang `SprintsPage` | Junior Developer | ✅ | `steps/STEP-2.3-sprints-page-integration.md` | 2026-08-18 15:40 |

### Phase 3: Board Filter Integration & Verification
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 3.1 | Tích hợp bộ lọc Sprint trên trang Board (`?sprintId=...`) và nút điều hướng từ Sprint Detail sang Board | Junior Developer | ✅ | `steps/STEP-3.1-board-sprint-filter.md` | 2026-08-18 15:42 |
| 3.2 | Tech Lead Review, UX/UI Review và QA Verification kiểm thử toàn bộ luồng xem chi tiết sprint, cập nhật sprint, gán task và mở task | QA Engineer | ✅ | `steps/STEP-3.2-verification.md` | 2026-08-18 15:43 |

## Artifacts hoàn thành (tổng)
- [x] `src/app/api/projects/[projectId]/sprints/[sprintId]/route.ts`
- [x] `src/components/sprint/sprint-detail-dialog.tsx`
- [x] `src/components/board/new-task-dialog.tsx`
- [x] `src/app/projects/[projectId]/sprints/page.tsx`
- [x] `src/app/projects/[projectId]/board/page.tsx`
- [x] `code-graph/CODE-GRAPH.md`

## Blockers
Không có
