---
task: compact-task-card-footer-layout
created: 2026-08-20
updated: 2026-08-20
status: done
workflow: WF-FASTTRACK
priority: P3
---

# PLAN MASTER: Tối Ưu Bố Cục Thẻ Task — Loại Bỏ Khoảng Trống Thừa Hàng Dưới Cùng & Slot Nhãn

## 1. Mô tả sự cố
Người dùng gửi 2 ảnh chụp chi tiết thẻ task (#8 và #5) và phản hồi:
- **"hàng dưới cùng phí khoảng trống"**: Do trước đó gán chiều cao tối thiểu cứng (`min-h-[142px]`) và vùng nhãn cố định (`min-h-[22px]`), dẫn đến:
  1. Thẻ không có nhãn (như #8) bị hổng một khoảng trắng lớn giữa tiêu đề và đường kẻ phân cách.
  2. Hàng chân trang (footer) có đường kẻ phân cách chiếm diện tích lớn, khi không có bình luận/ngày hạn thì phía bên trái bị trống rỗng hoàn toàn, chỉ có nút gán người `+` bên phải.

## 2. Giải pháp kỹ thuật (Clean Compact Design)
1. **Loại bỏ khoảng trống nhân tạo**:
   - Bỏ `min-h-[142px]` cố định trên thẻ.
   - Bỏ `min-h-[22px]` slot rỗng — chỉ kết xuất nhãn khi task thực sự có nhãn (`{(isTicket || labels.length > 0) && ...}`).
2. **Thu gọn hàng dưới cùng (Footer / Meta row)**:
   - Tối ưu padding thẻ: `p-2.5 sm:p-3`.
   - Thu gọn đường kẻ phân cách và padding chân trang: `pt-1.5 mt-1 border-t border-line/40`.
   - Giúp thẻ task trở nên gọn gàng, thanh thoát, tận dụng tối đa không gian hiển thị thông tin mà không bị lãng phí diện tích.

## 3. Workflow: WF-FASTTRACK (P3)
1. **Junior Developer (L5)**: Tối ưu lại `TaskCardComponent` nhỏ gọn, tinh tế.
2. **Tech Lead (L3)**: Review kiểm tra layout & hierarchy.
3. **UX/UI Reviewer (L5)**: Đánh giá trực quan theo 7 tiêu chí (C1–C7).
4. **QA Engineer (L5)**: Type-check & verification test.
5. **DevOps Engineer (L5)**: Release verification.

## 4. Steps
| # | Bước | Agent | Status | Hoàn thành lúc |
|---|------|-------|--------|-----------------|
| 1.1 | Tinh chỉnh giao diện thẻ task gọn gàng & loại bỏ khoảng trống thừa | Junior Developer | ✅ | 2026-08-20 14:28 |
| 1.2 | Code review | Tech Lead | ✅ | 2026-08-20 14:29 |
| 1.3 | Đánh giá trực quan UI (C1–C7) | UX/UI Reviewer | ✅ | 2026-08-20 14:29 |
| 1.4 | Verification & Type-Check | QA Engineer | ✅ | 2026-08-20 14:30 |
| 1.5 | Build check & Hoàn tất triển khai | DevOps Engineer | ✅ | 2026-08-20 14:30 |