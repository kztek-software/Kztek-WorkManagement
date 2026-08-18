# STEP 1.1 — Bổ sung API DELETE và hoàn thiện cập nhật Sprint

## Nhiệm vụ
Bổ sung handler `DELETE` trong `src/app/api/projects/[projectId]/sprints/[sprintId]/route.ts` để khi xóa sprint, tự động gỡ `sprintId` của các tasks liên quan (trả về Backlog) và xóa sprint khỏi cơ sở dữ liệu. Đồng thời hỗ trợ `PATCH` cập nhật tên, mục tiêu, ngày bắt đầu, ngày kết thúc và trạng thái Sprint.

## Handoff Log
- Đã kiểm tra route và schema.
- Thêm kiểm tra quyền thành viên và xác thực người dùng.
- Phát broadcast event `SPRINT_CHANGED` qua SSE bus.
