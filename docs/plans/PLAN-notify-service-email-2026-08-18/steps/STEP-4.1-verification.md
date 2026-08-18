---
step: 4.1
plan: ../PLAN-MASTER.md
agent: qa-engineer
status: done
completed_at: 2026-08-18 13:58
deps: [3.1]
---

# STEP 4.1 — Kiểm thử & Nghiệm thu toàn diện tính năng Notify & Mail Service

## Input nhận
Toàn bộ code và giao diện từ các bước trước.

## Nhiệm vụ
1. Kiểm tra luồng tạo task mới gán cho thành viên -> kiểm tra Notification + Email Log.
2. Kiểm tra luồng đổi Assignee và Status -> kiểm tra thông báo & email gửi đi.
3. Kiểm tra tính năng Gửi thử nghiệm email qua modal.
4. Cập nhật `CODE-GRAPH.md` và đồng bộ tài liệu.

## Definition of Done
- [x] Tất cả các ca kiểm thử PASS 100%.
- [x] Codebase sạch, không có lỗi TypeScript hay runtime error.

## Đã làm
- Kiểm tra render HTML Email templates cho các sự kiện Giao việc (Task Assigned), Cập nhật trạng thái (Status Changed), Bình luận (Comment), và Kiểm tra hệ thống (Test Email).
- Kiểm tra tích hợp trigger thông báo đa kênh trong các API routes của Task, Comment và Ticket Conversion.
- Cập nhật `CODE-GRAPH.md` với các module và file mới tạo.

## Artifact
- `code-graph/CODE-GRAPH.md`
