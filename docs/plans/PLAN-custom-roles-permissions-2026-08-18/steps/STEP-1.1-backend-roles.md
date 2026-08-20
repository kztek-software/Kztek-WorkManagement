# STEP 1.1: Nâng cấp Backend APIs cho Roles & Project Members

**Task:** Mở rộng API `/api/roles`, `/api/roles/[roleKey]` và `/api/projects/[projectId]/members` hỗ trợ custom roles linh hoạt.
**Agent:** Senior Developer
**Status:** In Progress

## Nội dung thực hiện
1. `/api/roles`: Cung cấp API POST tạo role với name, key, description, color, permissions.
2. `/api/roles/[roleKey]`: Cung cấp PATCH sửa thông tin + phân quyền, DELETE xóa vai trò (chuyển user về MEMBER).
3. `/api/projects/[projectId]/members`: Cho phép role nhận bất kỳ string key hợp lệ nào thay vì giới hạn trong enum 3 giá trị, đồng thời trả về danh sách role definitions để dropdown lựa chọn.
