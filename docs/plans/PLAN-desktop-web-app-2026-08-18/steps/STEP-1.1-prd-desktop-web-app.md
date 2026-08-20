# STEP-1.1: PRD & Đặc Tả Nghiệp Vụ Ứng Dụng Máy Tính Dạng Web App (Desktop Workstation)

## 1. Bối cảnh & Mục tiêu Sản phẩm
- **Dự án**: KZTEK Work Management
- **Giai đoạn**: Phase 4 (Giai đoạn 4) — Ứng Dụng Máy Tính Dạng Web App
- **Đối tượng sử dụng**: Kỹ sư phần mềm, Trưởng dự án, Product Manager, Kỹ thuật viên & Quản trị viên sử dụng máy tính để bàn (Desktop PC) và máy tính xách tay (Laptop) với màn hình lớn (1080p, 2K, 4K, Dual Monitor, Ultrawide).
- **Vấn đề cần giải quyết**:
  - Giao diện web truyền thống thường chỉ hiển thị dạng 1 khung nhìn (single view), đòi hỏi người dùng phải chuyển qua lại giữa nhiều tab/trang khi cần vừa xem Kanban Board vừa viết tài liệu hoặc vừa kiểm tra tickets.
  - Thao tác chuột nhiều làm giảm tốc độ làm việc của kỹ sư và PM. Cần có Command Palette (`Ctrl + K`) và hệ thống phím tắt chuyên sâu để điều khiển toàn bộ ứng dụng mà không cần rời tay khỏi bàn phím.
  - Kỹ sư và Quản lý dự án thường xuyên cần công cụ tính toán nhanh: ước tính Story Points (Fibonacci), tính Capacity của Sprint dựa trên số nhân sự và ngày công, tính tốc độ hoàn thành công việc và ghi chú nhanh mà không muốn mở ứng dụng ngoài.
  - Cần khả năng cài đặt ứng dụng vào máy tính như một phần mềm độc lập (Desktop PWA Standalone Mode) với icon trên Taskbar/Desktop và phím tắt khởi động nhanh.

---

## 2. Đặc Tả Tính Năng Chi Tiết (User Stories & Acceptance Criteria)

### US-1: Trang Làm Việc Máy Tính Chuyên Dụng (Desktop Workstation Portal - `/desktop`)
- **User Story**: Là một kỹ sư/PM trên máy tính, tôi muốn có một không gian làm việc chuyên biệt `/desktop` hỗ trợ chia khung nhìn (Split View) và hiển thị đa nhiệm, để tôi có thể làm việc với năng suất cao nhất trên màn hình lớn.
- **Acceptance Criteria (AC)**:
  - [AC-1.1]: Route `/desktop` hiển thị giao diện Full-screen Workstation tối ưu cho màn hình máy tính $\ge 1024px$.
  - [AC-1.2]: Hỗ trợ chế độ **Dual-Pane Split View**: Cho phép chia 2 panel độc lập (Trái: Kanban Board, Phải: Task Detail / Tickets / Notion Docs / Sprints).
  - [AC-1.3]: Cho phép người dùng linh hoạt đổi tỷ lệ chia màn hình (50/50, 60/40, 70/30) hoặc chuyển về 1 khung nhìn toàn màn hình chỉ với 1 click hoặc phím tắt.
  - [AC-1.4]: Tích hợp thanh trạng thái máy tính (**Desktop Status Bar & Dock**) dưới đáy màn hình hiển thị: Trạng thái Server (Online/Offline, Ping ms), Tên dự án hiện tại, Đồng hồ thời gian thực, Nút mở nhanh Widget Máy tính, Nút trợ giúp phím tắt và Nút Fullscreen.

### US-2: Global Command Palette (`Ctrl + K` / `Cmd + K`)
- **User Story**: Là người dùng máy tính, tôi muốn bấm `Ctrl + K` ở bất cứ đâu để tìm kiếm nhanh và thực hiện tác vụ tức thời.
- **Acceptance Criteria (AC)**:
  - [AC-2.1]: Bấm tổ hợp phím `Ctrl + K` (hoặc `Cmd + K` trên macOS) sẽ mở cửa sổ Command Palette mờ giữa màn hình.
  - [AC-2.2]: Hỗ trợ tìm kiếm nhanh công việc, dự án, tickets và các trang chức năng.
  - [AC-2.3]: Hỗ trợ nhóm lệnh tắt (Quick Actions): Tạo việc mới (`New Task`), Mở máy tính (`Open Calculator`), Chuyển dự án, Mở Dashboard, Mở Kanban, Đổi giao diện Sáng/Tối.
  - [AC-2.4]: Điều hướng danh sách kết quả bằng phím `Mũi tên lên / xuống`, chọn bằng `Enter`, đóng bằng `Escape`.

### US-3: Bảng Tra Cứu Phím Tắt Máy Tính (Desktop Shortcuts Hub)
- **User Story**: Là một power user, tôi muốn tra cứu và sử dụng phím tắt cho mọi hành động chính trong hệ thống.
- **Acceptance Criteria (AC)**:
  - [AC-3.1]: Bấm phím `?` hoặc `Ctrl + /` sẽ mở bảng Shortcuts Cheat-sheet hiển thị toàn bộ phím tắt.
  - [AC-3.2]: Các phím tắt quy định rõ ràng: `Ctrl + K` (Command Palette), `C` (Tạo Task mới), `Alt + C` (Mở Máy tính), `Alt + S` (Mở Scratchpad), `1-5` (Chuyển trang nhanh), `F11` / `Alt + F` (Fullscreen), `Esc` (Đóng mọi modal/dialog).

### US-4: Bộ Công Cụ Smart Work Calculator & Productivity Hub
- **User Story**: Là PM và thành viên dự án, tôi muốn có các công cụ tính toán công việc tích hợp ngay trên màn hình máy tính để hỗ trợ lập kế hoạch và ước lượng mà không cần mở Excel/Máy tính ngoài.
- **Acceptance Criteria (AC)**:
  - [AC-4.1]: **Floating Office Calculator**: Widget máy tính nổi có thể kéo/thu gọn, hỗ trợ đầy đủ phép tính số học cơ bản (+, -, *, /, %, $\sqrt{x}$, $\pm$) với lịch sử tính toán.
  - [AC-4.2]: **Story Points & Capacity Estimator**:
    - Nhập số thành viên nhóm (Team size), số ngày sprint, tỷ lệ focus (Focus factor %).
    - Tự động tính tổng công suất (Team Capacity Hours) và ước tính Story Points tối đa mà nhóm có thể cam kết trong Sprint.
    - Hỗ trợ thang điểm ước lượng Fibonacci (1, 2, 3, 5, 8, 13, 21) kèm gợi ý độ phức tạp task.
  - [AC-4.3]: **Project Progress & KPI Calculator**:
    - Tính toán tỷ lệ hoàn thành (Burn rate %), dự báo ngày hoàn thành dự kiến (Estimated Completion Date).
    - Tính toán chi phí phân bổ dựa trên Man-day / Man-month.
  - [AC-4.4]: **Desktop Scratchpad**:
    - Khung ghi chú nhanh ghim trên desktop, tự động lưu vào LocalStorage, hỗ trợ Markdown cơ bản, nút sao chép nhanh hoặc dán vào bình luận Task.

### US-5: Desktop PWA & Standalone Installation
- **User Story**: Là người dùng muốn trải nghiệm như một phần mềm máy tính bản địa (Native Desktop App), tôi muốn cài đặt ứng dụng vào hệ điều hành (Windows/macOS/Linux) chỉ với 1 click.
- **Acceptance Criteria (AC)**:
  - [AC-5.1]: File `manifest.json` đầy đủ thông tin metadata, name: `"KZTEK Work Management"`, display: `"standalone"`, background_color: `"#251C53"`, theme_color: `"#251C53"`.
  - [AC-5.2]: Cung cấp các shortcuts trên icon máy tính: "Bảng Kanban", "Báo cáo KPI", "Quản lý Tickets", "Máy tính Công việc".
  - [AC-5.3]: Hiển thị nút "Cài đặt ứng dụng máy tính" (Install Desktop App) trên Header/Status Bar khi trình duyệt hỗ trợ.

---

## 3. Handoff Log
- **Người bàn giao**: Product Manager & Business Analyst (L2/L4)
- **Người nhận bàn giao**: UI/UX Designer & Tech Lead (L4/L3)
- **Nội dung bàn giao**: Bộ 5 User Stories và các tiêu chí Acceptance Criteria chi tiết cho Phase 4 Desktop Web App. Sẵn sàng cho việc thiết kế UX/UI spec và kiến trúc hệ thống.
