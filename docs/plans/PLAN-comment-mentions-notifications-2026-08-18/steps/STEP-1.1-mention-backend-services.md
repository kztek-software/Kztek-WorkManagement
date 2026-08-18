# STEP-1.1: Bổ sung Backend Service Gửi Email & Notification khi Tag tài khoản (@mention)

- **Mục tiêu**: Thêm hàm gửi email `sendTaskMentionEmail` vào `src/lib/mail.ts` và hàm `notifyTaskMention` vào `src/lib/notifications.ts`.
- **Agent phụ trách**: Senior Developer (L4)
- **Files liên quan**: `src/lib/mail.ts`, `src/lib/notifications.ts`

## Yêu cầu kỹ thuật:
1. `src/lib/mail.ts`:
   - Hàm `sendTaskMentionEmail`:
     - Nhận các tham số: `taskNumber`, `taskTitle`, `projectName`, `projectKey`, `projectId`, `taskId`, `authorName`, `commentBody`, `recipientName`, `recipientEmail`.
     - Template HTML chuẩn Brand KZTEK (#251C53 / #F05922) với banner "@ Bạn được nhắc đến trong bình luận", trích dẫn blockquote nội dung bình luận, thông tin task và nút bấm "Xem bình luận trong công việc".
2. `src/lib/notifications.ts`:
   - Hỗ trợ type `MENTIONED` trong `NotificationType`.
   - Hàm `notifyTaskMention`:
     - Nhận danh sách các `mentionedUserIds` (hoặc email/usernames).
     - Tạo bản ghi Notification DB cho từng người được tag với type `MENTIONED`, message: `${author.name} đã nhắc đến bạn trong bình luận công việc ${project.key}-${task.number}`.
     - Gọi `sendTaskMentionEmail` gửi đến email đăng ký của người được tag.
     - Bắn sự kiện realtime SSE.
