---
step: 3.2
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 13:51
deps: ["3.1"]
---

# STEP 3.2 — Tích hợp 1-Click Convert Ticket thành Bug/Task trên Kanban Board

## Input nhận
Trang quản lý ticket và API từ STEP 3.1.

## Nhiệm vụ
1. Viết API endpoint `POST /api/projects/[projectId]/tickets/[ticketId]/convert`:
   - Tạo mới 1 Task với `type: "BUG"`, sao chép thông tin tiêu đề, mô tả, mức độ ưu tiên từ Ticket.
   - Thêm nhãn (Label) `Báo lỗi KH`, gán `convertedTaskId` cho Ticket và cập nhật trạng thái Ticket sang `IN_PROGRESS`.
   - Ghi lại log Activity và thông báo realtime qua Event Bus.
2. Tích hợp nút "Chuyển thành Task trên Board" trực tiếp trên Ticket Drawer:
   - Cho phép chọn Sprint, Người phụ trách (Assignee), Cột trạng thái ban đầu (TODO/BACKLOG/IN_PROGRESS).
   - Hiển thị huy hiệu `Ticket KH` trên TaskCard của Kanban Board và Banner liên kết hai chiều trong TaskDialog.

## Definition of Done
- [x] Chuyển đổi từ Ticket sang Task hoạt động trơn tru 1 chạm.
- [x] Task mới xuất hiện ngay trên Kanban Board với loại BUG và nhãn báo lỗi khách hàng.
- [x] Khách hàng tra cứu qua mã tracking thấy trạng thái được cập nhật sang "Đang xử lý".
- [x] Thẻ TaskCard và TaskDialog có huy hiệu và banner dẫn trực tiếp về Hộp thư Ticket.

## Đã làm
- Triển khai API `src/app/api/projects/[projectId]/tickets/[ticketId]/convert/route.ts` với đầy đủ liên kết 2 chiều, gán nhãn `Báo lỗi KH`, bắn SSE event và notification.
- Cập nhật `src/components/board/task-card.tsx` hiển thị badge `Ticket KH` khi task có nguồn gốc từ customer ticket.
- Cập nhật `src/components/board/task-dialog.tsx` với banner thông báo nguồn gốc và nút mở trực tiếp Hộp thư Ticket.

## Artifact
- `src/app/api/projects/[projectId]/tickets/[ticketId]/convert/route.ts`
- `src/components/board/task-card.tsx`
- `src/components/board/task-dialog.tsx`

## Quyết định quan trọng
- Tự động gắn nhãn "Báo lỗi KH" và định dạng mô tả sự cố kèm thông tin khách hàng, môi trường thiết bị để kỹ sư có đầy đủ bối cảnh khi xử lý trên Kanban Board.

## Handoff Payload — bước sau đọc phần này
- do_not_redo: Tính năng chuyển đổi Ticket sang Kanban Task đã hoàn tất.
- watch_out: UX/UI Reviewer đánh giá toàn bộ các màn hình Portal (`/portal`, `/portal/[projectKey]`, `/portal/tickets/[trackingCode]`) và Internal Inbox (`/projects/[projectId]/tickets`).
- next_inputs: Tiến hành đánh giá trực quan ở STEP 4.1.

## Commit
- Hash: local-step-3.2
- Đã push: Không

