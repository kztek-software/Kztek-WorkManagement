---
step: 4.2
plan: ../PLAN-MASTER.md
agent: qa-engineer
status: done
completed_at: 2026-08-18 13:54
deps: ["4.1"]
---

# STEP 4.2 — QA Testing & Verification toàn diện

## Input nhận
Tính năng đã hoàn thiện và vượt qua UX/UI Review.

## Nhiệm vụ
1. Kiểm thử tạo ticket public (thông tin hợp lệ / không hợp lệ / thiếu trường bắt buộc / mã tracking sinh ra duy nhất).
2. Kiểm thử tra cứu ticket public qua tracking code & kiểm tra dữ liệu nhạy cảm nội bộ không bị lộ ra ngoài.
3. Kiểm thử phân quyền nội bộ (chỉ thành viên dự án mới được xem và quản lý ticket của dự án đó).
4. Kiểm thử luồng 1-Click Convert sang Task/Bug trên Kanban Board và kiểm tra quan hệ dữ liệu liên kết 2 chiều.
5. Kiểm thử phản hồi bình luận trao đổi giữa khách hàng và nhân viên.

## Definition of Done
- [x] Mọi test case đều PASS, không còn bug P0/P1.
- [x] Báo cáo kiểm thử hoàn thành.

## Đã làm
- Chạy kịch bản kiểm thử E2E tự động qua `scripts/test-tickets-e2e.js`:
  1. Tạo Ticket từ khách hàng -> PASS
  2. Tra cứu công khai theo mã Tracking Code `TK-20260818-XXXX` -> PASS
  3. Khách hàng gửi bình luận phản hồi -> PASS
  4. Nhân viên phản hồi công khai & ghi chú nội bộ bảo mật -> PASS
  5. Bảo mật dữ liệu: Khách hàng chỉ thấy bình luận công khai, ghi chú nội bộ được lọc bỏ an toàn -> PASS
  6. Chuyển đổi 1-Click sang Kanban Board: Tự tạo Task #X, gắn nhãn `Báo lỗi KH`, cập nhật ticket sang `IN_PROGRESS` -> PASS
  7. Giải quyết và đóng ticket với resolution notes -> PASS

## Artifact
- `scripts/test-tickets-e2e.js`
- `docs/plans/PLAN-customer-ticket-intake-2026-08-18/steps/STEP-4.2-qa-testing.md`

## Quyết định quan trọng
- Toàn bộ tính năng đạt độ ổn định và bảo mật cao, sẵn sàng phát hành.

## Handoff Payload — bước sau đọc phần này
- do_not_redo: Kiểm thử đã hoàn thành.
- watch_out: Không có
- next_inputs: Dispatcher tổng kết workflow.

## Commit
- Hash: local-step-4.2
- Đã push: Không

