# STEP-1.1: PRD & Đặc Tả Nghiệp Vụ Ứng Dụng Desktop Độc Lập Chuẩn Zalo PC

## 1. Bối cảnh & Mục tiêu Sản phẩm
- **Dự án**: KZTEK Work Management
- **Yêu cầu cốt lõi**: Xây dựng thành ứng dụng máy tính độc lập (Standalone Desktop App) giống trải nghiệm của Zalo PC, Slack, Notion Desktop, không cần mở qua trình duyệt web.
- **Đối tượng sử dụng**: Toàn bộ nhân viên, kỹ sư, ban quản lý KZTEK và đối tác làm việc trên hệ điều hành Windows / macOS / Linux.
- **Giá trị mang lại**:
  - Không cần mở trình duyệt web, không bị lẫn lộn giữa hàng chục tab trình duyệt.
  - Chạy thường trực dưới khay hệ thống (System Tray) với mức tiêu thụ tài nguyên tối thiểu.
  - Bật thông báo tức thì (Native Windows Toast Notifications) khi có task được gán, comment nhắc tên hoặc ticket khẩn từ khách hàng.
  - Biểu tượng icon phần mềm chuyên nghiệp trên màn hình Desktop và thanh Taskbar Windows.

---

## 2. Đặc Tả Tính Năng Chi Tiết (User Stories & Acceptance Criteria)

### US-1: Khởi Động 1-Click Không Cần Mở Trình Duyệt Web (Native App Window)
- **User Story**: Là nhân viên KZTEK, tôi muốn nhấp đúp vào biểu tượng phần mềm ngoài màn hình Desktop để mở ứng dụng trong một cửa sổ máy tính riêng biệt, không có thanh địa chỉ web.
- **Acceptance Criteria (AC)**:
  - [AC-1.1]: Cung cấp file thực thi / launcher `KZTEK-Work.cmd` và shortcut `KZTEK Work Management.lnk` trên màn hình Desktop của người dùng.
  - [AC-1.2]: Cửa sổ mở lên dưới dạng Standalone Window không viền trình duyệt (No browser address bar, no browser tabs/bookmarks).
  - [AC-1.3]: Thanh Taskbar Windows hiển thị biểu tượng Logo KZTEK riêng biệt với tiêu đề *"KZTEK Work Management"*.
  - [AC-1.4]: Kích thước cửa sổ mặc định $1440 \times 900$, lưu nhớ vị trí và trạng thái phóng to (Maximized state) của lần sử dụng trước.

### US-2: Khay Hệ Thống & Chạy Nền (System Tray - Chuẩn Zalo PC)
- **User Story**: Là người dùng máy tính, khi tôi nhấn nút Đóng (X) trên cửa sổ, tôi muốn ứng dụng thu nhỏ xuống khay hệ thống cạnh đồng hồ Windows để vẫn nhận được thông báo mà không chiếm chỗ trên màn hình.
- **Acceptance Criteria (AC)**:
  - [AC-2.1]: Biểu tượng icon KZTEK xuất hiện ở System Tray (góc dưới bên phải màn hình).
  - [AC-2.2]: Nhấp đúp chuột trái vào Tray Icon sẽ lập tức mở lại cửa sổ làm việc lên trên cùng (Bring to Front).
  - [AC-2.3]: Nhấp chuột phải vào Tray Icon sẽ hiển thị Menu ngữ cảnh:
    - 🏢 *Mở KZTEK Work*
    - 🖥️ *Chế độ Máy tính Đa nhiệm (/desktop)*
    - 🎫 *Phiếu Khách Hàng (Tickets)*
    - 🚀 *Khởi động cùng Windows (Auto-start)*
    - ❌ *Thoát hoàn toàn (Exit)*

### US-3: Thông Báo Toast Màn Hình Máy Tính (Native Desktop Notifications)
- **User Story**: Là kỹ sư đang làm việc, tôi muốn nhận thông báo nổi góc phải màn hình Windows khi có việc mới được giao.
- **Acceptance Criteria (AC)**:
  - [AC-3.1]: Tự động đăng ký quyền thông báo Desktop của hệ điều hành.
  - [AC-3.2]: Gửi thông báo kèm âm thanh thông báo nhẹ khi có Task mới, Subtask hoàn thành hoặc Ticket khẩn.

---

## 3. Handoff Log
- **Người bàn giao**: Product Manager & Business Analyst (L2/L4)
- **Người nhận bàn giao**: UI/UX Designer & Tech Lead (L4/L3)
- **Nội dung bàn giao**: Bộ User Stories và Acceptance Criteria chi tiết cho Ứng dụng Desktop Độc Lập chuẩn Zalo PC.
