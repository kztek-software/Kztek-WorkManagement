---
step: 1.1
name: mobile-audit-prd
agent: product-manager
status: done
---

# STEP 1.1: Phân Tích Yêu Cầu PRD & Acceptance Criteria Cho Mobile Responsive Web

## Mục tiêu
Xác định phạm vi, hành trình người dùng (User Journeys) và tiêu chuẩn nghiệm thu (Acceptance Criteria) khi sử dụng hệ thống KZTEK Work Management trên thiết bị di động.

## Tiêu chuẩn nghiệm thu (AC)
1. **AC-1 (Viewport & Layout)**: Hỗ trợ hoàn hảo từ kích thước tối thiểu 360px đến 1024px. Không bị vỡ khung, tràn ngang ngoài ý muốn (`overflow-x` body không được xuất hiện).
2. **AC-2 (Navigation)**:
   - Sidebar trên Desktop chuyển thành Drawer trượt có Backdrop trên Mobile/Tablet (< 1024px).
   - Có thanh điều hướng ngón tay cái dưới đáy màn hình (Mobile Bottom Navigation Bar) truy cập nhanh các màn hình chính.
3. **AC-3 (Kanban Board)**: Hỗ trợ cuộn ngang mượt mà từng cột hoặc bấm dải Tab chuyển nhanh cột trên màn hình điện thoại.
4. **AC-4 (Dialogs & Forms)**: Popup/Modal chiếm tối đa 95vw, tự động co giãn chiều cao và cuộn nội dung, biểu mẫu xếp 1 cột dễ thao tác chạm.
5. **AC-5 (Touch Targets)**: Mọi nút bấm, tab và liên kết có diện tích chạm tối thiểu $\ge 40px \times 40px$.
