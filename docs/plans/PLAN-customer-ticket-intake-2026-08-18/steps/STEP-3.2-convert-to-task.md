---
step: 3.2
plan: ../PLAN-MASTER.md
agent: senior-developer
status: todo
completed_at:
deps: ["3.1"]
---

# STEP 3.2 — Tích hợp 1-Click Convert Ticket thành Bug/Task trên Kanban Board

## Input nhận
Trang quản lý ticket và API từ STEP 3.1.

## Nhiệm vụ
1. Viết API endpoint `POST /api/projects/[projectId]/tickets/[ticketId]/convert`:
   - Tạo mới 1 Task với `type: "BUG"`, sao chép thông tin tiêu đề, mô tả, mức độ ưu tiên từ Ticket.
   - Thêm nhãn (Label) `Customer Report` / `Ticket`, gán `convertedTaskId` cho Ticket và cập nhật trạng thái Ticket sang `IN_PROGRESS` / `TRIAGED`.
   - Ghi lại log Activity và thông báo realtime qua Event Bus.
2. Tích hợp nút "Chuyển thành Task trên Board" trực tiếp trên Ticket Drawer:
   - Cho phép chọn Sprint, Người phụ trách (Assignee), Cột trạng thái ban đầu (TODO/BACKLOG).
   - Sau khi chuyển đổi thành công, hiển thị liên kết nhanh sang Task trên Board và ngược lại từ Task Card có link về Ticket gốc.

## Definition of Done
- [ ] Chuyển đổi từ Ticket sang Task hoạt động trơn tru 1 chạm.
- [ ] Task mới xuất hiện ngay trên Kanban Board với loại BUG và nhãn báo lỗi khách hàng.
- [ ] Khách hàng tra cứu qua mã tracking thấy trạng thái được cập nhật sang "Đang xử lý".

## Đã làm


## Artifact


## Quyết định quan trọng


## Handoff Payload — bước sau đọc phần này
- do_not_redo: Không có
- watch_out: Không có
- next_inputs: Không có

## Commit
- Hash: 
- Đã push: Không
