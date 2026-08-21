---
step: 1.1
title: Thiết kế & Triển khai Hàng đợi Thông báo Bất đồng bộ (NotificationQueue)
agent: senior-developer
status: in_progress
---

# STEP 1.1: Thiết kế & Triển khai Hàng đợi Thông báo Bất đồng bộ

## Nhiệm vụ
1. Tạo module src/lib/notification-queue.ts:
   - Định nghĩa các loại công việc thông báo: ASSIGNED, STATUS_CHANGED, COMMENTED, MENTIONED, CUSTOM.
   - Xây dựng lớp NotificationQueueManager với cơ chế enqueue non-blocking (0ms) và worker background loop (setImmediate).
   - Tích hợp cơ chế xử lý lỗi, chống deadlock connection pool CSDL, và ghi log worker.