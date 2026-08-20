---
step: 1.1
title: Tách hàng độc lập cho ô Hạn chót & mở rộng không gian nhập liệu
agent: junior-developer
status: in_progress
---

# STEP 1.1: Tách hàng độc lập cho ô Hạn chót & mở rộng không gian nhập liệu

## Nhiệm vụ
1. Cập nhật src/components/board/task-dialog.tsx:
   - Chuyển grid grid-cols-2 trong hộp "PHÂN LOẠI" thành các hàng độc lập (space-y-3).
   - Ô Hạn chót (	ype="date") chiếm trọn chiều rộng với padding chuẩn px-3 h-9.
   - Sidebar cột phải: lg:grid-cols-[1fr_340px].