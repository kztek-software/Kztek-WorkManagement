---
task: fix-task-dialog-date-picker-clipping
created: 2026-08-20
updated: 2026-08-20
status: in_progress
workflow: WF-FASTTRACK
priority: P3
---

# PLAN MASTER: Khắc Phục Lỗi Bị Xén / Cắt Chữ Ô Chọn Thời Gian (Hạn Chót) Trong Task Dialog

## 1. Mô tả sự cố
Người dùng gửi ảnh chụp Task Dialog và phản hồi:
- **"chỗ chọn thời gian bị xem vào"**: Trong panel "PHÂN LOẠI" ở cột bên phải, ô chọn thời gian "Hạn chót" (<input type="date">) bị xếp chung hàng với "Điểm ước lượng" (grid-cols-2). Do độ rộng cột phải hẹp (~320px), ô ngày tháng chỉ có ~120px khiến chuỗi ngày tháng mm/dd/yyyy và icon lịch bị ép chật chội, cắt xén (clipping) và đè lên viền.

## 2. Giải pháp kỹ thuật
1. **Tách riêng ô Hạn chót thành hàng độc lập toàn chiều rộng (Full Width)**:
   - Trong src/components/board/task-dialog.tsx:
     - Tách "Hạn chót hoàn thành" thành 1 hàng riêng biệt với w-full và h-9 px-3, đảm bảo chuỗi ngày tháng và biểu tượng lịch có đầy đủ không gian hiển thị thoáng đãng, không bao giờ bị xén.
     - Đặt "Điểm ước lượng (Story points)" thành 1 hàng riêng biệt với placeholder rõ ràng.
2. **Mở rộng nhẹ độ rộng sidebar**:
   - Chỉnh lg:grid-cols-[1fr_340px] để cột phải thoải mái hơn trên màn hình máy tính.

## 3. Workflow: WF-FASTTRACK (P3)
1. **Junior Developer (L5)**: Tách hàng ô chọn ngày tháng và mở rộng không gian hiển thị.
2. **Tech Lead (L3)**: Code review & kiểm tra responsiveness.
3. **UX/UI Reviewer (L5)**: Đánh giá trực quan theo 7 tiêu chí (C1–C7).
4. **QA Engineer (L5)**: Type-check & verification test.
5. **DevOps Engineer (L5)**: Release verification.

## 4. Steps
| # | Bước | Agent | Status | Hoàn thành lúc |
|---|------|-------|--------|-----------------|
| 1.1 | Tách hàng độc lập cho ô Hạn chót & mở rộng không gian nhập liệu | Junior Developer | 🔄 | — |
| 1.2 | Code review | Tech Lead | ⬜ | — |
| 1.3 | Đánh giá trực quan UI (C1–C7) | UX/UI Reviewer | ⬜ | — |
| 1.4 | Verification & Type-Check | QA Engineer | ⬜ | — |
| 1.5 | Build check & Hoàn tất triển khai | DevOps Engineer | ⬜ | — |