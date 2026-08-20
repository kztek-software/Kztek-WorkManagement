---
step: 1.1
title: Khắc phục layout overflow & ghim composer, tối ưu render mô tả TaskDialog
agent: junior-developer
status: done
completed_at: 2026-08-20 13:41
---

# STEP 1.1: Khắc phục layout overflow & ghim composer, tối ưu render mô tả TaskDialog

## Nhiệm vụ
1. Cấu hình lại layout TaskDialog: lex flex-col h-[90vh] max-h-[90vh] trên DialogContent, shrink-0 trên Header, lex-1 min-h-0 grid trên Body.
2. Cột trái chia thành 2 phần: vùng cuộn nội dung (lex-1 min-h-0 overflow-y-auto) và vùng ghim bình luận (shrink-0 border-t bg-surface/95).
3. Cột phải độc lập cuộn mượt mà (h-full overflow-y-auto).
4. Thêm component hiển thị Markdown (RenderMarkdownDescription) cho phần Mô tả với chế độ Xem/Sửa trực quan.
5. Chuyển đổi thẻ <a> sang <Link> cho Customer Ticket banner.

## Files đã sửa
- src/components/board/task-dialog.tsx

## Handoff Log
- Junior Developer đã hoàn tất cập nhật layout TaskDialog và component render Markdown.
- Bàn giao sang Tech Lead & UX/UI Reviewer kiểm tra.