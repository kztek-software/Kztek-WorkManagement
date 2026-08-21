---
task: rich-text-formatting-toolbar
created: 2026-08-21
updated: 2026-08-21
status: done
workflow: WF-FEATURE
priority: P2
---

# PLAN MASTER: Bổ sung định dạng văn bản phong phú (1. 2. 3., in đậm, in nghiêng, gạch chân, màu sắc,...)

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## 1. Mô tả yêu cầu & Mục tiêu
Bổ sung hệ thống thanh công cụ định dạng văn bản (Rich Text Formatting Toolbar) và bộ kết xuất nội dung phong phú (Rich Markdown Renderer) cho toàn bộ các ô nhập văn bản (Mô tả công việc, bình luận trao đổi, ghi chú ticket, mục tiêu sprint, scratchpad):
1. **Định dạng số thứ tự & danh sách**: Hỗ trợ danh sách có thứ tự `1. `, `2. `, `3. ` và danh sách gạch đầu dòng `- `, `* `, `• `.
2. **Định dạng văn bản nội dòng (Inline Styles)**:
   - In đậm: `**chữ đậm**` (Ctrl+B)
   - In nghiêng: `*chữ nghiêng*` (Ctrl+I)
   - Gạch chân: `<u>chữ gạch chân</u>` (Ctrl+U)
   - Gạch ngang: `~~chữ gạch ngang~~` (Ctrl+Shift+X)
   - Màu sắc chữ: Đỏ `[color:red]`, Xanh lá `[color:green]`, Xanh dương `[color:blue]`, Vàng cam `[color:amber]`, Tím `[color:purple]`
   - Màu nền Highlight: `==nội dung highlight==`
3. **Định dạng khối (Block Styles)**: Tiêu đề H1, H2, H3, Trích dẫn `> `, Khối mã ````code````, Checklist `- [ ] `.
4. **Tích hợp toàn diện**:
   - `TaskDialog` (Mô tả chi tiết & Xem trước)
   - `MentionCommentInput` & `RenderCommentContent` (Bình luận công việc & Ticket)
   - `NewTaskDialog` (Mô tả khi tạo mới)
   - `TicketDrawer` (Ghi chú nội bộ, Kết quả xử lý & Trao đổi)
   - `SprintDetailDialog` (Mục tiêu sprint)
   - `DesktopScratchpad` (Ghi chú nhanh)

## 2. Phases & Steps

### Phase 1: Xây dựng Module Toolbar & Rich Parser Renderer
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Xây dựng component `RichTextToolbar` (`src/components/ui/rich-text-toolbar.tsx`) hỗ trợ đầy đủ các nút định dạng, phím tắt và xử lý bọc text thông minh | Senior Developer | ✅ | `steps/STEP-1.1-rich-text-toolbar.md` | 2026-08-21 10:18 |
| 1.2 | Xây dựng component `RichMarkdown` (`src/components/ui/rich-markdown.tsx`) kết xuất an toàn, chuẩn xác mọi cú pháp danh sách số `1. 2. 3.`, màu sắc, gạch chân, in đậm, highlight | Senior Developer | ✅ | `steps/STEP-1.2-rich-markdown-renderer.md` | 2026-08-21 10:19 |

### Phase 2: Tích hợp vào Task Dialog, New Task Dialog & Comments
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Nâng cấp `TaskDialog` và `NewTaskDialog` tích hợp `RichTextToolbar` và `RichMarkdown` | Junior Developer | ✅ | `steps/STEP-2.1-task-dialogs-integration.md` | 2026-08-21 10:20 |
| 2.2 | Nâng cấp `MentionCommentInput` và `RenderCommentContent` hỗ trợ định dạng kết hợp `@mention` | Junior Developer | ✅ | `steps/STEP-2.2-comments-integration.md` | 2026-08-21 10:22 |
| 2.3 | Tích hợp vào `TicketDrawer`, `SprintDetailDialog`, `DesktopScratchpad` và `Portal` | Junior Developer | ✅ | `steps/STEP-2.3-tickets-sprints-scratchpad.md` | 2026-08-21 10:27 |

### Phase 3: Review, Kiểm Thử & Nghiệm Thu
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 3.1 | Viết test script tự động, kiểm tra Type check, UX/UI Review (C1–C7) và QA Verification | QA Engineer & Tech Lead | ✅ | `steps/STEP-3.1-qa-verification.md` | 2026-08-21 10:32 |

## 3. Danh sách Artifacts đã hoàn thiện
- [x] `src/components/ui/rich-text-toolbar.tsx`
- [x] `src/components/ui/rich-markdown.tsx`
- [x] `src/components/board/task-dialog.tsx`
- [x] `src/components/board/new-task-dialog.tsx`
- [x] `src/components/board/mention-comment-input.tsx`
- [x] `src/components/tickets/ticket-drawer.tsx`
- [x] `src/components/sprint/sprint-detail-dialog.tsx`
- [x] `src/components/desktop/desktop-scratchpad.tsx`
- [x] `src/app/portal/page.tsx`
- [x] `src/app/portal/tickets/[trackingCode]/page.tsx`
- [x] `scripts/test-rich-text-formatting.ts`
- [x] `code-graph/CODE-GRAPH.md`
