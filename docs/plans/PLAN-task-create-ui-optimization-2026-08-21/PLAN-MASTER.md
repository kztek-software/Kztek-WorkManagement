---
task: task-create-ui-optimization
created: 2026-08-21
updated: 2026-08-21
status: completed
workflow: WF-FASTTRACK
priority: P3
---

# PLAN MASTER: Tối ưu lại UI Task Create — Căn giữa ô Mô tả và Danh sách việc con

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở steps/STEP-[N.M]-[tên].md tương ứng.

## 1. Mô tả yêu cầu & Mục tiêu
Tối ưu hóa giao diện Modal Tạo công việc mới (NewTaskDialog):
1. **Mở rộng kích thước & Cân đối bố cục**: Nâng cấp modal từ max-w-2xl lên max-w-4xl giúp không gian nhập liệu rộng rãi, thoáng đãng, chuyên nghiệp.
2. **Căn giữa & Đối xứng 2 Cột (Mô tả chi tiết & Danh sách việc con)**:
   - **Cột Trái (Mô tả chi tiết)**: Tích hợp FileText icon, RichTextToolbar (định dạng 1. 2. 3., in đậm, in nghiêng, màu sắc...), hỗ trợ xem trước Markdown, chiều cao đồng bộ.
   - **Cột Phải (Danh sách việc con / Checklist)**: Tích hợp CheckSquare icon, badge đếm số lượng, ô nhập thêm việc con nhanh [Input + Nút Thêm / Enter], danh sách việc con có nút xóa ✕, và empty state hướng dẫn trực quan.
3. **Bố cục Thuộc tính & Nhãn phân loại**: Sắp xếp 6 thuộc tính cốt lõi (Loại task, Trạng thái, Ưu tiên, Điểm ước lượng, Người phụ trách, Sprint) và Nhãn phân loại ngăn nắp.
4. **Phím tắt & Trải nghiệm tương tác**: Giữ vững Ctrl+Enter (Tạo việc), Esc (Hủy), Alt+A (AI Gợi ý), thêm việc con bằng phím Enter trong input subtask.

## 2. Phases & Steps

### Phase 1: Tối ưu UI & Tương tác NewTaskDialog
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Tái cấu trúc layout NewTaskDialog sang 2 cột đối xứng ở phần thân (Mô tả bên trái, Checklist bên phải), bổ sung tính năng thêm subtask thủ công | Junior Developer | ✅ | steps/STEP-1.1-optimize-task-create-ui.md | 2026-08-21 10:35 |

### Phase 2: Review, UX/UI Inspection & Verification
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Code Review, UX/UI Review (C1–C7) và Smoke Test xác nhận luồng tạo task hoàn chỉnh | Tech Lead & QA Engineer | ✅ | steps/STEP-2.1-review-and-qa.md | 2026-08-21 10:38 |

## 3. Danh sách Artifacts dự kiến
- [x] src/components/board/new-task-dialog.tsx
- [x] code-graph/CODE-GRAPH.md