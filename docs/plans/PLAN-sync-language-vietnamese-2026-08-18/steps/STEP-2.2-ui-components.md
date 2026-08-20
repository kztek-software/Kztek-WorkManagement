# STEP 2.2: Đồng bộ hóa toàn bộ UI Components, Modals, Dialogs, Pages

- **Mục tiêu**: Thay thế toàn bộ text tiếng Anh trong các dialog, card, filter, bảng biểu, dashboard và reports.
- **Tiêu chí hoàn thành**:
  - `task-dialog.tsx`: Description -> Mô tả chi tiết, Due date -> Hạn chót, Assignee -> Người phụ trách, Story Points -> Điểm ước lượng (Story points), Checklist -> Danh mục kiểm tra, Attachments -> Tệp đính kèm, Comments -> Bình luận trao đổi, Activity -> Lịch sử hoạt động.
  - `new-task-dialog.tsx`: Form labels và placeholders đồng bộ Tiếng Việt.
  - `sprint-detail-dialog.tsx`: Sprint Goal -> Mục tiêu Sprint, Workload -> Phân bổ khối lượng, Assignees -> Nhân sự, Burn Story Points -> Điểm hoàn thành, Backlog -> Danh sách chờ.
  - `ticket-drawer.tsx` & `ticket-list-view.tsx`: Customer Portal & Dispatcher labels.
  - `dashboard/page.tsx` & `reports/page.tsx`: Charts, KPI titles & breakdowns.
