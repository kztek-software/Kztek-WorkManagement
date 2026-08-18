---
task: comment-mentions-notifications
created: 2026-08-18
updated: 2026-08-18
status: done
workflow: WF-FEATURE
priority: P1
---

# PLAN MASTER: Comment, Tag tài khoản (@mention), Gửi Email, Upload File/Ảnh/Video lỗi & Notification Center

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mô tả
Nâng cấp và hoàn thiện toàn diện hệ thống tương tác, đính kèm lỗi và thông báo cho KZTEK Work Management:
1. **Comment & Tag tài khoản (`@mention`)**:
   - Gõ `@` tự động hiển thị dropdown autocomplete gợi ý danh sách thành viên dự án.
   - Hỗ trợ format và render badge `@Tên Thành Viên` nổi bật trong nội dung comment.
2. **Gửi thông báo & Email khi được Tag (@mention)**:
   - Gửi **Branded HTML Email** thông báo ngay lập tức về hòm thư đăng ký của người được tag với trích dẫn nội dung và liên kết trực tiếp đến công việc.
   - Tạo in-app Notification phân loại `MENTIONED`.
3. **Upload & Xem trước File, Ảnh, Video lỗi cạnh mô tả**:
   - Thêm model `Attachment` và API upload đa tệp tin (ảnh, video mô phỏng lỗi, logs, tài liệu).
   - Component `TaskAttachmentGallery` đặt cạnh/dưới mô tả cho phép kéo thả tệp, xem ảnh phóng to và phát video trực tiếp.
4. **Nâng cấp Ô Thông Báo (Notification Center Hub)**:
   - Ô thông báo đa năng với bộ lọc thông minh: **Tất cả**, **Việc được giao**, **Được nhắc đến (@)**, **Bình luận**, **Đổi trạng thái**.
   - Click vào thông báo chuyển ngay tới Task tương ứng và tự động mở Dialog chi tiết công việc.

## Nguồn yêu cầu
- Yêu cầu gốc: "Bổ sung tính nằng comment, tag tài khoản, khi được tag sẽ gửi thông báo qua mail đăng ký, Bổ sung ô thông báo cho các tài khoản bấm vào sẽ biết được cacs việc được giao, comment,... bổ sung phần upload các file, ảnh, video lỗi bên cạnh mô tả"
- Workflow: WF-FEATURE — Tính năng mới
- Agent chain: PM → BA → EM → Tech Lead → Senior Developer → Junior Developer → UX/UI Reviewer → QA Engineer

## Phases & Steps

### Phase 1: Database Schema & Backend Services
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Cập nhật Prisma Schema (`Attachment` model), generate client & migrate DB | Senior Developer | ✅ | `steps/STEP-1.1-prisma-attachment.md` | 2026-08-18 15:10 |
| 1.2 | Xây dựng API Upload tệp/ảnh/video và Task Attachments API | Senior Developer | ✅ | `steps/STEP-1.2-upload-api.md` | 2026-08-18 15:13 |
| 1.3 | Bổ sung hàm gửi email khi được tag `sendTaskMentionEmail` và hàm notify `notifyTaskMention` trong `mail.ts` & `notifications.ts` | Senior Developer | ✅ | `steps/STEP-1.3-mention-backend-services.md` | 2026-08-18 15:14 |
| 1.4 | Cập nhật API Comment `/api/projects/[projectId]/tasks/[taskId]/comments` xử lý parsing mentions & kích hoạt notify | Senior Developer | ✅ | `steps/STEP-1.4-comment-mention-api.md` | 2026-08-18 15:14 |

### Phase 2: Frontend Attachments & Mention Components
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Xây dựng component `TaskAttachmentGallery` đính kèm và xem trước ảnh, video lỗi, file logs cạnh mô tả | Junior Developer | ✅ | `steps/STEP-2.1-attachment-gallery-ui.md` | 2026-08-18 15:15 |
| 2.2 | Xây dựng component `MentionCommentInput` Autocomplete `@mention` và render tag badge trong TaskDialog | Junior Developer | ✅ | `steps/STEP-2.2-mention-input-ui.md` | 2026-08-18 15:15 |
| 2.3 | Tích hợp Attachment Gallery và Mention Comments hoàn chỉnh vào `TaskDialog` | Junior Developer | ✅ | `steps/STEP-2.3-task-dialog-integration.md` | 2026-08-18 15:15 |

### Phase 3: Nâng cấp Notification Center UI & Deep-linking
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 3.1 | Nâng cấp `NotificationBell` thành Notification Center hoàn chỉnh với Tabs phân loại, Badge unread, và Quick Actions | Senior Developer | ✅ | `steps/STEP-3.1-notification-center-ui.md` | 2026-08-18 15:16 |
| 3.2 | Hỗ trợ mở trực tiếp TaskDialog từ URL query param (`?taskId=...`) khi bấm vào thông báo | Junior Developer | ✅ | `steps/STEP-3.2-task-url-deep-linking.md` | 2026-08-18 15:16 |

### Phase 4: Review & Verification
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 4.1 | Tech Lead Review, UX/UI Review và QA Verification kiểm thử toàn bộ luồng upload file/ảnh/video, tag tài khoản, gửi email và ô thông báo | QA Engineer | ✅ | `steps/STEP-4.1-verification.md` | 2026-08-18 15:25 |

## Artifacts hoàn thành (tổng)
- [x] `prisma/schema.prisma`
- [x] `src/app/api/upload/route.ts`
- [x] `src/app/api/projects/[projectId]/tasks/[taskId]/attachments/route.ts`
- [x] `src/lib/mail.ts`
- [x] `src/lib/notifications.ts`
- [x] `src/app/api/projects/[projectId]/tasks/[taskId]/comments/route.ts`
- [x] `src/components/board/task-attachment-gallery.tsx`
- [x] `src/components/board/mention-comment-input.tsx`
- [x] `src/components/board/task-dialog.tsx`
- [x] `src/components/notifications/notification-bell.tsx`
- [x] `src/app/projects/[projectId]/board/page.tsx`
- [x] `code-graph/CODE-GRAPH.md`

## Blockers
Không có
