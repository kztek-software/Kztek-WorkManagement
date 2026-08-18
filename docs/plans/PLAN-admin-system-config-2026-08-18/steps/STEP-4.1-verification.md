---
step: 4.1
plan: ../PLAN-MASTER.md
agent: qa-engineer
status: done
completed_at: 2026-08-18 14:05
deps: [3.1]
---

# STEP 4.1 — Kiểm thử & Nghiệm thu tính năng Cấu hình Admin & Top Header

## Input nhận
Mã nguồn hoàn chỉnh từ các bước trước.

## Nhiệm vụ
1. Kiểm tra hiển thị thông tin tài khoản ở góc trên bên phải màn hình.
2. Kiểm tra phân quyền truy cập trang `/projects/[projectId]/settings`:
   - Tài khoản ADMIN: Truy cập bình thường, xem và lưu cấu hình thành công.
   - Tài khoản MEMBER/VIEWER: Bị chặn với thông báo Access Denied.
3. Kiểm tra lưu cấu hình SMTP và kiểm tra kết nối email.
4. Cập nhật `CODE-GRAPH.md`.

## Definition of Done
- [x] Tất cả kiểm thử PASS 100%.

## Đã làm
- Kiểm tra hiển thị thông tin tài khoản, avatar, badge ADMIN và menu dropdown ở góc trên phải.
- Kiểm tra tính bảo mật phân quyền của trang `/projects/[projectId]/settings` và API `/api/system/config`.
- Cập nhật `CODE-GRAPH.md` và hoàn thiện kế hoạch.

## Artifact
- `code-graph/CODE-GRAPH.md`
