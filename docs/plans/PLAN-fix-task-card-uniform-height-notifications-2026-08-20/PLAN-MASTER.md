---
task: fix-task-card-uniform-height-notifications
created: 2026-08-20
updated: 2026-08-20
status: done
workflow: WF-FASTTRACK
priority: P3
---

# PLAN MASTER: Đồng Bộ Tuyệt Đối Kích Thước Thẻ Task & Khắc Phục Gửi Thông Báo/Email Khi Gán Việc

## 1. Mô tả sự cố
Người dùng phản hồi 2 vấn đề:
1. **Kích thước các thẻ task vẫn chưa đồng đều**: Thẻ task 1 dòng không nhãn (như task #2 test2, #1 test) bị co ngắn (~70px) trong khi thẻ 2 dòng có nhãn (#7) dài ~140px. Cần chuẩn hóa cấu trúc thẻ để tất cả thẻ task trên board có cùng chiều cao đồng nhất, hàng lối thẳng tắp.
2. **Gán người thực hiện không thấy gửi email và thông báo**: Khi gán việc (kể cả tự nhận việc hoặc gán cho thành viên khác), không nhận được thông báo in-app (chuông) và email thông báo do điều kiện chặn `assigneeId !== user.id` và `assigneeId === actorId`.

## 2. Root Cause Analysis
- `src/components/board/task-card.tsx`:
  - Đặt chiều cao thẻ `min-h-[142px]` với Title slot `min-h-[38px]` và Label slot `min-h-[22px]` để mọi thẻ đều có kích thước tương đương nhau.
- `src/app/api/projects/[projectId]/tasks/[taskId]/route.ts` & `src/app/api/projects/[projectId]/tasks/route.ts`:
  - Gỡ bỏ `d.assigneeId !== user.id` và `task.assigneeId !== user.id` để luôn gọi `notifyTaskAssigned`.
- `src/lib/notifications.ts`:
  - Gỡ bỏ điều kiện chặn tự nhận việc trong `notifyTaskAssigned`, hỗ trợ tạo thông báo và gửi email toàn diện.

## 3. Workflow: WF-FASTTRACK (P3)
1. **Junior Developer (L5)**:
   - Chuẩn hóa layout `TaskCardComponent` với chiều cao đồng đều `min-h-[142px]`, title slot `min-h-[38px]`, label slot `min-h-[22px]`, footer `mt-auto`.
   - Mở khóa toàn diện logic thông báo & email trong `tasks/[taskId]/route.ts`, `tasks/route.ts`, và `notifications.ts`.
2. **Tech Lead (L3)**: Review kiểm tra tính ổn định & logic gửi thông báo.
3. **UX/UI Reviewer (L5)**: Đánh giá trực quan theo 7 tiêu chí (C1–C7).
4. **QA Engineer (L5)**: Type-check & verification test.
5. **DevOps Engineer (L5)**: Production build check.

## 4. Steps
| # | Bước | Agent | Status | Hoàn thành lúc |
|---|------|-------|--------|-----------------|
| 1.1 | Đồng bộ kích thước thẻ task & gỡ chặn thông báo/email khi gán việc | Junior Developer | ✅ | 2026-08-20 14:02 |
| 1.2 | Code review & logic verification | Tech Lead | ✅ | 2026-08-20 14:03 |
| 1.3 | Đánh giá trực quan UI (C1–C7) | UX/UI Reviewer | ✅ | 2026-08-20 14:03 |
| 1.4 | Verification & Type-Check | QA Engineer | ✅ | 2026-08-20 14:04 |
| 1.5 | Build check & Hoàn tất triển khai | DevOps Engineer | ✅ | 2026-08-20 14:04 |