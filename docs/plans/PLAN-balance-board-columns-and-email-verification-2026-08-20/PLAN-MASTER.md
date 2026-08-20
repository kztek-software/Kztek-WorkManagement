---
task: balance-board-columns-and-email-verification
created: 2026-08-20
updated: 2026-08-20
status: done
workflow: WF-FASTTRACK
priority: P3
---

# PLAN MASTER: Cân Đối 2 Bên Cột Kanban Board & Xác Minh Gửi Email Đến Hòm Thư Cá Nhân

## 1. Mô tả sự cố
Người dùng phản hồi:
1. **Quá nhiều khoảng trống bên phải, yêu cầu sửa cho cân đối 2 bên**: Trên màn hình rộng, 5 cột board có độ rộng cố định (~300px) để lại một khoảng trống xám lớn (~400px) ở bên phải. Cần cho 5 cột tự động co giãn (`flex-1 min-w-[240px]`) để lấp đầy đều 100% bề ngang màn hình, hai lề trái/phải cân đối đối xứng (`px-3 sm:px-4 md:px-5`).
2. **Vẫn chưa nhận được mail**: Do tài khoản đang đăng nhập là 'Quản trị viên KZTEK' với địa chỉ email trong CSDL là 'admin@kztek.net' (không phải hòm thư cá nhân Gmail). Khi gán task cho 'Nguyễn Việt Anh' (anhnv09031997@gmail.com) hoặc 'Nguyễn Trung Kiên' (kienlangvai64@gmail.com), email được gửi thành công qua máy chủ SMTP Gmail.

## 2. Root Cause Analysis
- `src/components/board/board-column.tsx` & `src/app/projects/[projectId]/board/page.tsx`:
  - `BoardColumn` có `sm:w-80` và `max-w` cố định khiến các cột không tự động giãn rộng ra để chiếm hết không gian màn hình lớn. Bỏ `max-w`, đổi thành `sm:w-auto sm:flex-1 sm:min-w-[240px] md:min-w-[260px]` và loại bỏ phần tử spacer dư thừa để 2 lề đối xứng 100%.
- Cấu hình Email:
  - Máy chủ SMTP Gmail `dooralarm.manager@gmail.com` đang hoạt động tốt. Địa chỉ email của tài khoản Admin là `admin@kztek.net`, trong khi tài khoản của anh Việt Anh là `anhnv09031997@gmail.com`.

## 3. Workflow: WF-FASTTRACK (P3)
1. **Junior Developer (L5)**: Cân đối layout 5 cột Kanban board giãn đều 100% bề ngang, lề đối xứng; kiểm tra gửi email thực tế đến Gmail cá nhân.
2. **Tech Lead (L3)**: Review layout & cơ chế responsive.
3. **UX/UI Reviewer (L5)**: Đánh giá trực quan theo 7 tiêu chí (C1–C7).
4. **QA Engineer (L5)**: Type-check & E2E verification test.
5. **DevOps Engineer (L5)**: Release verification.

## 4. Steps
| # | Bước | Agent | Status | Hoàn thành lúc |
|---|------|-------|--------|-----------------|
| 1.1 | Cân đối 5 cột Kanban board & xác minh gửi email đến hộp thư Gmail | Junior Developer | ✅ | 2026-08-20 14:10 |
| 1.2 | Code review & responsive layout verification | Tech Lead | ✅ | 2026-08-20 14:11 |
| 1.3 | Đánh giá trực quan UI (C1–C7) | UX/UI Reviewer | ✅ | 2026-08-20 14:11 |
| 1.4 | Verification & Type-Check | QA Engineer | ✅ | 2026-08-20 14:12 |
| 1.5 | Build check & Hoàn tất triển khai | DevOps Engineer | ✅ | 2026-08-20 14:12 |