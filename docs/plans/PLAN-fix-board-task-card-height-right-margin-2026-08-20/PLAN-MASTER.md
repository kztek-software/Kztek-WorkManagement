---
task: fix-board-task-card-height-right-margin
created: 2026-08-20
updated: 2026-08-20
status: done
workflow: WF-FASTTRACK
priority: P3
---

# PLAN MASTER: Đồng Bộ Kích Thước Thẻ Task & Bổ Sung Margin Phải Cho Cột Hoàn Thành

## 1. Mô tả sự cố
Người dùng gửi ảnh chụp màn hình Kanban Board và phản hồi 2 lỗi giao diện:
1. **Các task có kích thước không đồng đều (Inconsistent Card Heights)**: Các thẻ công việc có tiêu đề ngắn (1 dòng) hoặc không có nhãn/nhận xét (như task "test", "test2") bị co rút chiều cao đột ngột (~70px) so với các thẻ 2 dòng có nhãn (~135px), gây cảm giác lộn xộn, thiếu cân đối và mất nhịp điệu thị giác.
2. **Cột "HOÀN THÀNH" không có margin/padding bên phải**: Cột cuối cùng (Hoàn thành) khi cuộn ngang bị dính sát vào mép phải trình duyệt do cơ chế cuộn của CSS Flex container bỏ qua padding-right.

## 2. Root Cause Analysis
- src/components/board/task-card.tsx:
  - Thẻ TaskCard chưa thiết lập min-height tổng thể và vùng tiêu đề h3 chưa có min-h-[36px] cố định cho 2 dòng text.
  - Chân trang (footer) chưa dùng mt-auto để luôn ghim đáy thẻ một cách đồng bộ.
- src/app/projects/[projectId]/board/page.tsx:
  - Khung chứa các cột board (boardContainerRef) dùng flex overflow-x-auto nhưng thiếu spacer và padding-right mở rộng (pr-6 sm:pr-8 md:pr-10 + <div className="w-2 sm:w-4 shrink-0" />), khiến cột cuối cùng bị dính chặt vào cạnh phải.

## 3. Workflow: WF-FASTTRACK (P3)
1. **Junior Developer (L5)**:
   - Thêm flex flex-col justify-between min-h-[120px] sm:min-h-[124px] cho TaskCardComponent.
   - Đặt min-h-[36px] cho tiêu đề task để giữ nhịp 2 dòng chuẩn.
   - Thêm mt-auto cho footer thẻ task.
   - Thêm pr-6 sm:pr-8 md:pr-10 và phần tử spacer cuối cùng trong Kanban board container.
2. **Tech Lead (L3)**: Review kiểm tra tính ổn định layout & responsiveness.
3. **UX/UI Reviewer (L5)**: Đánh giá trực quan theo 7 tiêu chí (C1–C7).
4. **QA Engineer (L5)**: Type-check & smoke test xác thực.
5. **DevOps Engineer (L5)**: Production build check.

## 4. Steps
| # | Bước | Agent | Status | Hoàn thành lúc |
|---|------|-------|--------|-----------------|
| 1.1 | Đồng bộ chiều cao thẻ task & bổ sung margin phải cột hoàn thành | Junior Developer | ✅ | 2026-08-20 13:50 |
| 1.2 | Code review & kiểm tra visual balance | Tech Lead | ✅ | 2026-08-20 13:51 |
| 1.3 | Đánh giá trực quan UI (C1–C7) | UX/UI Reviewer | ✅ | 2026-08-20 13:51 |
| 1.4 | Verification & Type-Check | QA Engineer | ✅ | 2026-08-20 13:51 |
| 1.5 | Build check & Hoàn tất triển khai | DevOps Engineer | ✅ | 2026-08-20 13:52 |