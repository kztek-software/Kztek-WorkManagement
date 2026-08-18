---
step: 1.2
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 14:06
deps: ["1.1"]
---

# STEP 1.2 — Xây dựng File Upload API & Attachments CRUD

## Input nhận
Bảng Attachment và types từ STEP 1.1.

## Nhiệm vụ
1. Tạo thư mục tĩnh lưu trữ `public/uploads/`.
2. Viết API `POST /api/upload`:
   - Tiếp nhận `FormData` (hỗ trợ nhiều file đồng thời).
   - Validate định dạng: Image (png, jpg, jpeg, gif, webp, svg), Video (mp4, webm, mov), Documents (pdf, doc, docx, xls, xlsx, txt, zip, log).
   - Giới hạn dung lượng an toàn (Image/Doc <= 20MB, Video <= 100MB).
   - Lưu trữ với tên file duy nhất chống xung đột và trả về URL tĩnh `/uploads/...`.
3. Viết API `POST /api/attachments` và `DELETE /api/attachments/[id]` để gắn kết hoặc gỡ bỏ tệp khỏi Task/Ticket.

## Definition of Done
- [x] API Upload file hoạt động hoàn hảo và lưu trữ đúng định dạng.
- [x] API CRUD Attachments đã sẵn sàng cho Task & Ticket.

