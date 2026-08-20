---
task: fix-task-dialog-ui-overflow
created: 2026-08-20
updated: 2026-08-20
status: done
workflow: WF-FASTTRACK
priority: P3
---

# PLAN MASTER: Sửa Lỗi Tràn Giao Diện (UI Overflow) & Tối Ưu Hiển Thị Task Dialog

## 1. Mô tả sự cố
Người dùng gửi ảnh chụp màn hình giao diện chi tiết công việc (Task Dialog modal) gặp các lỗi giao diện sau:
1. **Tràn chiều cao và bị cắt mất thanh gửi bình luận (Comment Box cut-off)**: Modal Dialog không bị khống chế chiều cao tổng thể, khiến nội dung cột bên trái đẩy khung nhập bình luận (MentionCommentInput) xuống dưới đáy, làm khuất nửa ô soạn thảo và che mất toàn bộ thanh công cụ (Gắn thẻ @, Ctrl+Enter để gửi, nút Gửi bình luận).
2. **Mô tả chi tiết (Description) hiển thị thô và gò bó**: Nội dung mô tả được tạo từ Ticket khách hàng chứa Markdown (### 📝 Chi tiết sự cố:, ---, **...**) nhưng lại bị nhét vào thẻ Textarea rows=4 cố định, gây xuất hiện thanh cuộn nội bộ chật chội và không kết xuất định dạng trực quan.
3. **Điều hướng liên kết chưa tối ưu**: Nút Mở Hộp Thư Ticket trong banner nguồn dùng thẻ <a> thay vì Next.js Link.

## 2. Root Cause Analysis
- src/components/board/task-dialog.tsx: Thẻ DialogContent được đặt overflow-hidden nhưng thiếu cấu trúc flex flex-col h-[90vh] max-h-[90vh]. Phần body grid đặt lg:max-h-[78vh], khi kết hợp với header (~110px) làm tổng chiều cao vượt quá 90vh của DialogContent, dẫn đến việc khung bình luận chân trang (sticky composer) bị trượt ra ngoài vùng nhìn thấy của dialog.
- Cột bên trái (left column) chưa được phân tách rành mạch giữa vùng cuộn nội dung (flex-1 min-h-0 overflow-y-auto) và thanh soạn thảo ghim đáy (shrink-0 border-t bg-surface).
- Phần mô tả chưa có chế độ Render Markdown trực quan kết hợp chuyển đổi Sửa/Xem mượt mà.

## 3. Workflow: WF-FASTTRACK (P3)
1. **Junior Developer (L5)**: Tái cấu trúc layout Flexbox/Grid của TaskDialog, ghim cố định khung soạn thảo bình luận, tích hợp component hiển thị Markdown cho mô tả.
2. **Tech Lead (L3)**: Review kiểm tra tính ổn định layout, responsive trên mobile/tablet/desktop, và tương thích theme.
3. **UX/UI Reviewer (L5)**: Đánh giá trực quan giao diện theo 7 tiêu chí (C1–C7).
4. **QA Engineer (L5)**: Kiểm tra hoạt động cuộn, thêm bình luận, gắn thẻ @, sửa mô tả, và click liên kết.
5. **DevOps Engineer (L5)**: Kiểm tra lint/build và sẵn sàng release.

## 4. Steps
| # | Bước | Agent | Status | Hoàn thành lúc |
|---|------|-------|--------|-----------------|
| 1.1 | Khắc phục layout overflow & ghim composer, tối ưu render mô tả | Junior Developer | ✅ | 2026-08-20 13:41 |
| 1.2 | Code review & kiểm tra responsive layout | Tech Lead | ✅ | 2026-08-20 13:42 |
| 1.3 | Đánh giá trực quan UI (C1–C7) | UX/UI Reviewer | ✅ | 2026-08-20 13:43 |
| 1.4 | Verification & Type/Build Test | QA Engineer | ✅ | 2026-08-20 13:45 |
| 1.5 | Build check & Hoàn tất triển khai | DevOps Engineer | ✅ | 2026-08-20 13:46 |