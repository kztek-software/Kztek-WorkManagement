---
task: custom-roles-and-permissions-management
created: 2026-08-18
updated: 2026-08-18
status: in_progress
workflow: WF-FEATURE
priority: P1
---

# PLAN MASTER: Cho phép Tạo & Quản trị Phân quyền Tùy ý (Custom Roles & Permission Matrix)

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mô tả
1. **Thêm tính năng Tạo Vai trò / Phân quyền Tùy ý (Custom Role Creation)**:
   - Thêm nút "+ Tạo vai trò mới" trên Header và trong Danh sách vai trò tại tab "Ma trận Phân quyền".
   - Hộp thoại (Modal Dialog) tạo vai trò tùy chỉnh:
     - Tên vai trò (VD: Trưởng nhóm R&D, UI/UX Designer, DevOps Lead, QA Lead...).
     - Mã vai trò (Key) chuẩn hóa in hoa (VD: `RD_LEAD`, `DESIGNER`, `DEVOPS`...).
     - Mô tả chức năng & quyền hạn.
     - Chọn màu đại diện nhận diện trực quan.
     - Sao chép quyền nhanh từ vai trò có sẵn (Presets) hoặc tích chọn trực tiếp ma trận quyền ban đầu.
2. **Quản trị & Chỉnh sửa / Xóa vai trò tùy chỉnh (Role Management & Deletion)**:
   - Chỉnh sửa thông tin vai trò (Tên, mô tả, màu sắc).
   - Xóa vai trò tùy chỉnh (có cảnh báo và tự động chuyển các thành viên/tài khoản đang giữ vai trò về `MEMBER`).
   - Tiện ích ma trận phân quyền: Nút "Chọn tất cả" / "Bỏ chọn tất cả" cho từng nhóm danh mục quyền và toàn bộ quyền.
3. **Mở rộng Hệ thống Phân bổ Thành viên Dự án (Dynamic Roles in Project Members)**:
   - Cập nhật `MemberDialog` để hiển thị động tất cả các vai trò hệ thống và vai trò tùy chỉnh từ cơ sở dữ liệu.
   - Nâng cấp API `/api/projects/[projectId]/members` cho phép gán bất kỳ vai trò hợp lệ nào trong hệ thống mà không bị chặn enum cứng.

## Nguồn yêu cầu
- Yêu cầu gốc: "Đang ko cho tạo phân quyền tùy ý, sửa"
- Workflow: WF-FEATURE — Tính năng mới / Cải tiến phân quyền
- Agent chain: PM → BA → UI/UX → EM → Tech Lead → Senior Developer → Junior Developer → Tech Lead → UX/UI Reviewer → QA Engineer → QA Lead → DevOps Lead

## Phases & Steps

### Phase 1: Mở rộng API Backend & Validation
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Nâng cấp API `/api/roles`, `/api/roles/[roleKey]` và `/api/projects/[projectId]/members` hỗ trợ custom roles linh hoạt | Senior Developer | ✅ | `steps/STEP-1.1-backend-roles.md` | 2026-08-18 16:22 |

### Phase 2: Giao diện Quản trị Vai trò & Ma trận Phân quyền
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Xây dựng Modal Tạo vai trò mới, Modal Sửa vai trò, Nút Xóa vai trò tùy chỉnh & Tiện ích Chọn/Bỏ chọn nhanh trong `users/page.tsx` | Senior Developer | ✅ | `steps/STEP-2.1-roles-matrix-ui.md` | 2026-08-18 16:23 |
| 2.2 | Cập nhật `MemberDialog` cho phép chọn tất cả các vai trò tùy chỉnh khi thêm/đổi vai trò thành viên dự án | Junior Developer | ✅ | `steps/STEP-2.2-member-dialog-roles.md` | 2026-08-18 16:22 |

### Phase 3: Review & Verification
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 3.1 | Tech Lead Code Review, UX/UI Evaluation & QA Verification: Kiểm thử luồng tạo vai trò tùy ý, lưu phân quyền, phân bổ thành viên dự án và xóa vai trò | QA Engineer | ✅ | `steps/STEP-3.1-verification.md` | 2026-08-18 16:24 |

## Artifacts hoàn thành (tổng)
- [x] `src/app/api/roles/route.ts`
- [x] `src/app/api/roles/[roleKey]/route.ts`
- [x] `src/app/api/projects/[projectId]/members/route.ts`
- [x] `src/app/projects/[projectId]/users/page.tsx`
- [x] `src/components/project/member-dialog.tsx`
- [x] `code-graph/CODE-GRAPH.md`

## Blockers
Không có
