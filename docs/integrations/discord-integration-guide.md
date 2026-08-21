# Hướng Dẫn Tích Hợp Discord — KZTEK Work Management

Tài liệu này hướng dẫn từng bước để thiết lập tích hợp Discord cho hệ thống KZTEK Work Management, bao gồm 2 kênh thông báo độc lập:

- **DM cá nhân (Bot)**: chỉ gửi riêng cho người liên quan đến sự kiện (được giao việc, đổi trạng thái, có bình luận) — không gửi hàng loạt cho tất cả mọi người.
- **Webhook kênh chung**: đăng thông báo công khai vào 1 kênh Discord của team để mọi người cùng theo dõi.

Người thực hiện: **Quản trị viên (Admin)** làm Phần 1–3 một lần duy nhất cho toàn hệ thống. Phần 4 do **từng thành viên** tự làm cho tài khoản của mình.

---

## Phần 1 — Tạo Application & Bot trên Discord Developer Portal

> Chỉ Admin làm 1 lần.

1. Truy cập [discord.com/developers/applications](https://discord.com/developers/applications), đăng nhập bằng tài khoản Discord của bạn.
2. Bấm **"Ứng Dụng Mới" (New Application)** → đặt tên (ví dụ `KZTEK-BOT`) → đồng ý điều khoản → **Create**.
3. Vào mục **"Thông Tin Chung" (General Information)** → copy **ID ứng dụng (Application ID)** — đây chính là **Client ID**.

### 1.1. Lấy Client Secret + khai báo Redirect URL

4. Vào tab **"OAuth2"** (menu trái):
   - Phần **"Secret máy khách"** → bấm **"Đặt Lại Secret" (Reset Secret)** → copy giá trị hiện ra (chỉ hiện 1 lần).
   - Phần **"Chuyển hướng" (Redirects)** → bấm **"Thêm Redirect"** → nhập đúng URL sau (thay bằng App Base URL thật của hệ thống bạn — xem tại tab *Thương Hiệu & Base URL* trong Cài đặt Hệ thống của app):
     ```
     http://<app-base-url>:3000/api/integrations/discord/oauth/callback
     ```
   - Bấm **"Save Changes"**.

### 1.2. Tạo Bot + lấy Bot Token

5. Vào tab **"Bot"** (menu trái):
   - Bấm **"Reset Token"** → copy **Token** hiện ra (chỉ hiện 1 lần, mất là phải reset lại).
   - Không cần bật bất kỳ **Privileged Gateway Intent** nào (Presence/Server Members/Message Content) — gửi DM không cần các quyền này.
   - Bấm **"Lưu thay đổi"** nếu có banner nhắc.

### 1.3. Mời Bot vào server Discord của KZTEK

6. Vẫn ở tab **"OAuth2"**, cuộn xuống mục **"Công cụ tạo URL OAuth2"**:
   - Tick scope **`bot`**.
   - Sau khi tick, khung **"Quyền hạn Bot"** hiện ra → tick **"Gửi Tin Nhắn" (Send Messages)**.
   - Cuộn xuống cuối, copy **URL sinh ra**.
7. Mở URL đó ở tab mới → chọn server Discord của KZTEK từ danh sách → **Tiếp tục** → **Cho phép/Authorize**.

> ⚠️ **Giới hạn quan trọng**: Bot chỉ gửi được DM cho user nào **cùng ở trong server đã mời Bot vào**. Nếu 1 thành viên chưa tham gia server này, Bot sẽ không gửi được DM cho họ dù đã liên kết tài khoản.

---

## Phần 2 — Tạo Webhook cho kênh chung (tuỳ chọn)

> Bỏ qua phần này nếu chỉ cần DM cá nhân, không cần đăng thông báo vào kênh chung.

1. Vào server Discord của KZTEK → chọn kênh muốn nhận thông báo (VD: `#work-notifications`).
2. Bấm biểu tượng ⚙️ cạnh tên kênh (hoặc chuột phải → "Chỉnh sửa Kênh") → chọn **"Tích hợp" (Integrations)**.
3. Bấm **"Webhook"** → **"Tạo Webhook mới" (New Webhook)**.
4. Đặt tên (VD: `KZTEK Work Bot`), chọn đúng kênh → bấm **"Sao chép URL Webhook"** → lưu lại URL này (dạng `https://discord.com/api/webhooks/...`).

---

## Phần 3 — Nhập cấu hình vào hệ thống KZTEK

> Chỉ Admin làm, tại: **App → menu tài khoản (avatar góc trên phải) → Cài đặt Dự án & Cấu hình → tab Discord**.

1. Nhập 4 giá trị đã lấy ở Phần 1–2:
   - **Application (Client) ID**
   - **Client Secret (OAuth2)**
   - **Bot Token**
   - **Webhook URL (kênh chung)** — nếu có làm Phần 2
2. Tick **"Bật tích hợp"**.
3. Chọn quy tắc thông báo mong muốn:
   - **DM Cá Nhân**: Giao việc mới / Đổi trạng thái công việc / Bình luận & nhắc đến.
   - **Đăng Vào Kênh Chung (Webhook)**: Giao việc mới / Đổi trạng thái công việc / Bình luận mới.
4. Bấm **"Lưu Cấu Hình Discord"**.
5. **Test thử ngay tại đây**:
   - Ô "Gửi Thử Nghiệm" → nhập **Discord User ID** của bạn (xem cách lấy ở Phần 4, bước 1) → bấm nút **DM**.
   - Bấm **"Gửi Thử Webhook Kênh Chung"** để test kênh chung (nếu đã cấu hình Webhook URL).
   - Thấy thông báo **"Gửi thử nghiệm thành công!"** màu xanh là đã cấu hình đúng.

---

## Phần 4 — Mỗi thành viên tự liên kết tài khoản Discord cá nhân

> Mỗi user tự làm cho tài khoản của mình, để chỉ nhận đúng DM liên quan đến bản thân.

### Cách A — Tự liên kết qua OAuth (khuyến nghị, không cần thao tác kỹ thuật)

1. Đăng nhập app KZTEK → bấm vào **avatar/tên của mình** ở góc trên phải.
2. Bấm **"Kết nối Discord (nhận thông báo)"** trong menu sổ xuống.
3. Modal hiện ra → bấm **"Kết Nối Discord"**.
4. Được chuyển sang Discord → đăng nhập (nếu chưa) → bấm **"Cho phép/Authorize"**.
5. Được đưa về lại app, modal hiển thị **"Đã liên kết Discord: <username>"** — hoàn tất.

> ⚠️ Trước khi làm bước này, user cần **đã tham gia server Discord của KZTEK** (nơi Bot đã được mời ở Phần 1.3), nếu không sẽ liên kết được nhưng không nhận được DM.

### Cách B — Admin nhập tay (khi user không tự làm được)

1. User cần Bật **Chế Độ Nhà Phát Triển** trên Discord của họ để lấy ID:
   - Discord → biểu tượng ⚙️ **Cài đặt Người dùng** (góc dưới trái, cạnh tên) → mục **"Advanced"** → bật **"Developer Mode"**.
   - Chuột phải vào tên/avatar của chính họ → **"Copy User ID"** → gửi ID này cho Admin.
2. Admin vào app KZTEK → **Quản trị Cơ cấu & Phân quyền** → tìm user đó → bấm **Sửa** → dán ID vào ô **"Discord User ID"** → **Lưu**.

---

## Cách hoạt động (tóm tắt logic)

Khi có sự kiện (giao việc / đổi trạng thái / bình luận):

1. Hệ thống kiểm tra **công tắc tổng** ở Cài đặt Hệ thống (Phần 3, bước 3) — nếu tắt, không gửi.
2. Hệ thống kiểm tra **tùy chọn cá nhân** của người nhận (menu tài khoản → "Tùy chọn kênh nhận thông báo") — nếu user đó đã tự tắt kênh Discord cho loại sự kiện này, không gửi riêng cho họ (nhưng Webhook kênh chung vẫn đăng bình thường, vì đó là thông báo công khai không theo cá nhân).
3. Nếu cả 2 lớp trên đều cho phép **và** người nhận đã liên kết Discord (Phần 4) → gửi DM.
4. Webhook kênh chung đăng độc lập, không phụ thuộc việc user có liên kết cá nhân hay không.

---

## Xử Lý Lỗi Thường Gặp

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `OAuth2 redirect_uri không hợp lệ` | Redirect URL khai trong Discord Developer Portal không khớp chính xác với App Base URL thật của hệ thống | Vào lại OAuth2 tab trên Developer Portal, sửa đúng Redirect URL (kiểm tra kỹ IP/domain, có `http://` hay `https://`, có cổng `:3000` hay không) |
| `Invalid Form Body` khi gửi DM thử | Ô "Discord User ID" nhập sai định dạng (VD: nhập nhầm nội dung tin nhắn thay vì ID số) | Nhập đúng ID dạng số (snowflake, VD: `757439585834762292`), lấy qua Chế Độ Nhà Phát Triển như Phần 4B bước 1 |
| Gửi DM báo lỗi "không cùng server với Bot" | User nhận chưa tham gia server Discord đã mời Bot vào | Mời user đó vào đúng server, hoặc mời Bot vào server khác mà user đang có mặt |
| Webhook báo lỗi HTTP 404 | Webhook URL bị xóa hoặc copy sai/thiếu | Tạo lại Webhook mới trong Discord, copy đầy đủ URL |
