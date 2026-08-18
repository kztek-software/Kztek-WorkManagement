---
step: 2.1
plan: ../PLAN-MASTER.md
agent: junior-developer
status: done
completed_at: 2026-08-18 13:48
deps: ["1.2"]
---

# STEP 2.1 — Xây dựng Public Customer Portal

## Input nhận
APIs công khai từ STEP 1.2.

## Nhiệm vụ
Tạo giao diện khách hàng đẹp mắt, chuẩn phong cách KZTEK:
1. `src/app/portal/page.tsx` & `src/app/portal/[projectKey]/page.tsx`:
   - Form gửi báo lỗi hiện đại, thân thiện: thông tin người gửi, dự án, phân loại sự cố (Lỗi phần mềm, Góp ý tính năng, Yêu cầu hỗ trợ), mức độ ưu tiên/khẩn cấp, tiêu đề, mô tả chi tiết, môi trường thiết bị.
   - Trạng thái gửi thành công hiển thị popup/card xác nhận nổi bật kèm Tracking Code và nút copy link tra cứu.
2. `src/app/portal/tickets/[trackingCode]/page.tsx`:
   - Trang tra cứu tiến độ ticket công khai: thanh tiến trình trực quan (Mới tiếp nhận -> Đang xử lý -> Đang kiểm tra -> Đã giải quyết), thông tin chi tiết ticket, luồng trao đổi phản hồi giữa khách hàng và bộ phận hỗ trợ KZTEK.

## Definition of Done
- [x] Giao diện Portal hoạt động mượt mà, responsive, không yêu cầu đăng nhập.
- [x] Gửi báo lỗi thành công và nhận ngay mã tra cứu.
- [x] Trang tra cứu hiển thị đúng tiến độ và cho phép khách phản hồi thêm.

## Đã làm
- Xây dựng `src/app/portal/page.tsx` với thanh tra cứu nhanh, form gửi báo lỗi chi tiết, phân loại, chọn mức độ khẩn cấp, và màn hình xác nhận kèm nút sao chép mã `TK-XXXXXXXX-XXXX`.
- Xây dựng `src/app/portal/[projectKey]/page.tsx` cho phép truy cập portal theo mã dự án.
- Xây dựng `src/app/portal/tickets/[trackingCode]/page.tsx` với thanh tiến trình trực quan 5 bước, hiển thị ghi chú giải quyết từ kỹ sư, chi tiết sự cố và luồng bình luận trao đổi thời gian thực.

## Artifact
- `src/app/portal/page.tsx`
- `src/app/portal/[projectKey]/page.tsx`
- `src/app/portal/tickets/[trackingCode]/page.tsx`

## Quyết định quan trọng
- Cổng portal hỗ trợ cả tra cứu nhanh qua mã `TK-XXXXXXXX-XXXX` ngay trên trang chủ portal và hỗ trợ gửi phản hồi trực tiếp không cần đăng nhập.

## Handoff Payload — bước sau đọc phần này
- do_not_redo: Giao diện Public Portal đã hoàn thành đầy đủ.
- watch_out: Khi staff trả lời ticket nội bộ, có thể chọn `isInternalOnly: true` (chỉ nhân viên thấy) hoặc `false` (khách hàng thấy trên portal).
- next_inputs: Xây dựng giao diện Quản lý Ticket nội bộ trong dự án ở STEP 3.1.

## Commit
- Hash: local-step-2.1
- Đã push: Không
