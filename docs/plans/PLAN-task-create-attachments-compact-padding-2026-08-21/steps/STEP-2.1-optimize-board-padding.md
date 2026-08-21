# STEP-2.1: Tinh chỉnh padding và khoảng cách lề trên Kanban Board View

- **Agent thực hiện**: Junior Developer (L5)
- **Mục tiêu**: Tối ưu mật độ hiển thị trên màn hình Board (`board/page.tsx` & `board-column.tsx`), giảm padding thừa thãi.
- **Trạng thái**: Completed ✅

## Nội dung thực hiện
1. Điều chỉnh chiều cao và padding Header: `sm:h-12 px-2.5 sm:px-4 gap-2 sm:gap-2.5`, kích thước nút `h-7 sm:h-7.5`.
2. Điều chỉnh padding Filter Bar: `py-1.5 px-3.5 sm:px-4 gap-2.5`, search input `w-36 sm:w-52`.
3. Điều chỉnh padding Board Viewport: `gap-2.5 sm:gap-3 md:gap-3.5 p-2 sm:p-3 md:p-3.5 px-2.5 sm:px-3.5 md:px-4 pb-2.5`.
4. Tinh chỉnh Board Column: `p-2 sm:p-2`, header `px-1.5 py-1 mb-1`, empty state `h-28 p-3`.
5. Đảm bảo toàn bộ 5 cột hiển thị cân đối, tận dụng tối đa chiều rộng màn hình mà không bị xô lệch hay dồn cục.

## Handoff Log
- Đã hoàn tất tối ưu mật độ hiển thị Kanban Board.
- Chuyển giao sang Tech Lead & QA Engineer (STEP-2.2) để review, smoke test và cập nhật CODE-GRAPH.
