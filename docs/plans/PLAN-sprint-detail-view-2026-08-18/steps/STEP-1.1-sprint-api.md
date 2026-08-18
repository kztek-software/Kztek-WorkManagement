# STEP 1.1 — Bổ sung API DELETE và hoàn thiện cập nhật Sprint

## Nhiệm vụ
Bổ sung handler `DELETE` trong `src/app/api/projects/[projectId]/sprints/[sprintId]/route.ts` để khi xóa sprint, tự động gỡ `sprintId` của các tasks liên quan (trả về Backlog) và xóa sprint khỏi cơ sở dữ liệu. Đồng thời hỗ trợ `PATCH` cập nhật tên, mục tiêu, ngày bắt đầu, ngày kết thúc và trạng thái Sprint.

## Handoff Log
- Đã bổ sung phương thức `DELETE` giải phóng liên kết các task (`sprintId: null`) an toàn trước khi xóa bản ghi Sprint.
- Đã tối ưu hóa `PATCH` tự động de-activate các sprint khác khi kích hoạt một sprint mới.
- Đã broadcast các event `SPRINT_CHANGED` và `TASK_CHANGED` cho real-time synchronization qua Server-Sent Events.
- Trạng thái: ✅ Hoàn thành.
