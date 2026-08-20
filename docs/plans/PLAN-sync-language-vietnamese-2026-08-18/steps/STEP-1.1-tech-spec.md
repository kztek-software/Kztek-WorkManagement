# STEP 1.1: Chuẩn hóa bảng thuật ngữ (Glossary) & Kiến trúc hằng số

- **Mục tiêu**: Định nghĩa bảng dịch thuật nhất quán giữa các trạng thái (`STATUSES`), độ ưu tiên (`PRIORITIES`), loại công việc (`TASK_TYPES`), và các thuật ngữ phổ biến.
- **Tiêu chí hoàn thành**:
  - Không thay đổi các ID kỹ thuật (`BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `URGENT`, `HIGH`, `MEDIUM`, `LOW`, `TASK`, `STORY`, `BUG`, `EPIC`) để giữ toàn vẹn database.
  - Cập nhật toàn bộ thuộc tính `label` sang Tiếng Việt.
