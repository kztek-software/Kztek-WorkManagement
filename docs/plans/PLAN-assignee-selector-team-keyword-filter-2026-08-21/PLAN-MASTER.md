---
task: assignee-selector-team-keyword-filter
created: 2026-08-21
updated: 2026-08-21
status: in_progress
workflow: WF-FASTTRACK
priority: P3
---

# PLAN MASTER: Bổ Sung Bộ Lọc Nhóm (Team/Group), Tên Và Tìm Kiếm Từ Khóa (Keyword Search) Cho Phần Chọn Người Thực Hiện (Assignee Selector)

## 1. Mô tả yêu cầu
Người dùng yêu cầu: **"phần chọn user thực hiện bổ dung filer nhóm, tên, keyword"**.
- Khi gán người thực hiện công việc (trên thẻ Task Board, trong hộp thoại chi tiết Task Dialog, và trong hộp thoại Tạo Task Mới), cần có:
  1. **Ô tìm kiếm từ khóa (Keyword Search)**: Tìm nhanh tức thì theo tên, email, chức danh, vai trò.
  2. **Bộ lọc Nhóm / Đội ngũ (Team/Group Filter)**: Các chip/tab lọc theo từng nhóm chuyên môn (VD: Tất cả, Nhóm 1, Frontend, Backend, QA, etc.).
  3. **Hiển thị đầy đủ thông tin**: Avatar nhận diện, Họ tên thành viên, Badge Nhóm (Team), Vai trò (Role), dấu tích chọn trực quan.

## 2. Giải pháp kỹ thuật
1. **Nâng cấp API GET /api/projects/[projectId]/tasks**:
   - Bổ sung 	eam: { select: { id: true, name: true, code: true, color: true } } và email: true vào câu truy vấn projectMember để frontend có đầy đủ dữ liệu nhóm của nhân sự.
2. **Nâng cấp src/components/board/assignee-quick-select.tsx**:
   - Tích hợp ô tìm kiếm từ khóa (Search input với nút X xóa nhanh).
   - Tích hợp thanh chọn nhóm nhanh (Horizontal Team Pills: Tất cả, Nhóm A, Nhóm B...).
   - Tự động lọc real-time danh sách thành viên theo nhóm đã chọn + từ khóa tìm kiếm.
3. **Đồng bộ vào TaskDialog & NewTaskDialog**:
   - Sử dụng component chọn người thực hiện nâng cao hoặc cấu hình filter cho PrimeReact Dropdown.

## 3. Workflow: WF-FASTTRACK (P3)
1. **Junior Developer (L5)**: Nâng cấp API query và xây dựng UI tìm kiếm & lọc nhóm cho Assignee Selector.
2. **Tech Lead (L3)**: Code review & kiểm thử logic lọc đa điều kiện.
3. **UX/UI Reviewer (L5)**: Đánh giá trực quan theo tiêu chuẩn C1–C7.
4. **QA Engineer (L5)**: Type-check & verification test.
5. **DevOps Engineer (L5)**: Release validation.

## 4. Steps
| # | Bước | Agent | Status | Hoàn thành lúc |
|---|------|-------|--------|-----------------|
| 1.1 | Nâng cấp API tasks/route.ts trả về thông tin Team & Email của thành viên | Junior Developer | 🔄 | — |
| 1.2 | Xây dựng bộ lọc nhóm, tên & tìm kiếm từ khóa cho AssigneeQuickSelect & TaskDialog | Junior Developer | ⬜ | — |
| 1.3 | Code review | Tech Lead | ⬜ | — |
| 1.4 | Đánh giá trực quan UI (C1–C7) | UX/UI Reviewer | ⬜ | — |
| 1.5 | Verification & Type-Check | QA Engineer | ⬜ | — |
| 1.6 | Release validation & Hoàn tất | DevOps Engineer | ⬜ | — |