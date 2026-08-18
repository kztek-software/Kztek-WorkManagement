---
step: 2.1
plan: ../PLAN-MASTER.md
agent: junior-developer
status: todo
completed_at:
deps: ["1.2"]
---

# STEP 2.1 — Xây dựng Public Customer Portal

## Input nhận
APIs công khai từ STEP 1.2.

## Nhiệm vụ
Tạo giao diện khách hàng đẹp mắt, chuẩn phong cách KZTEK:
1. `src/app/portal/page.tsx` & `src/app/portal/[projectKey]/page.tsx`:
   - Form gửi báo lỗi hiện đại, thân thiện: thông tin người gửi, dự án, phân loại sự cố (Lỗi hệ thống, Góp ý tính năng, Yêu cầu hỗ trợ), mức độ ưu tiên/khẩn cấp, tiêu đề, mô tả chi tiết, môi trường thiết bị.
   - Trạng thái gửi thành công hiển thị popup/card xác nhận nổi bật kèm Tracking Code và nút copy link tra cứu.
2. `src/app/portal/tickets/[trackingCode]/page.tsx`:
   - Trang tra cứu tiến độ ticket công khai: thanh tiến trình trực quan (Mới tiếp nhận -> Đang xử lý -> Đang kiểm tra -> Đã giải quyết), thông tin chi tiết ticket, luồng trao đổi phản hồi giữa khách hàng và bộ phận hỗ trợ KZTEK.

## Definition of Done
- [ ] Giao diện Portal hoạt động mượt mà, responsive, không yêu cầu đăng nhập.
- [ ] Gửi báo lỗi thành công và nhận ngay mã tra cứu.
- [ ] Trang tra cứu hiển thị đúng tiến độ và cho phép khách phản hồi thêm.

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
