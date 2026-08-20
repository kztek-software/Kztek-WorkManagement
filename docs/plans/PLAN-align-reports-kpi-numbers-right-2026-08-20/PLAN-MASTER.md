---
task: align-reports-kpi-numbers-right
created: 2026-08-20
updated: 2026-08-20
status: completed
workflow: WF-FASTTRACK
priority: P3
---

# PLAN MASTER: Căn Phải Các Ô Số & Cột Dữ Liệu Số Liệu Trong Bảng Báo Cáo & KPI

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## 1. Mô tả vấn đề
- Trong trang **Báo cáo & KPI** (`/projects/[projectId]/reports`), bảng dữ liệu **"Ma trận So sánh Năng suất Nhân sự Toàn đội"** hiện đang căn giữa (`text-center`) tiêu đề cột và các ô chứa giá trị số liệu (`Tổng việc`, `Hoàn thành`, `Đang làm`, `Quá hạn`, `Points (Xong/Tổng)`).
- Theo nguyên tắc UX/UI Data Table & Financial/Productivity Metrics chuẩn, các cột số liệu cần được **căn phải (`text-right`)** cả ở tiêu đề cột (header `<th>`) và ô dữ liệu (`<td>`) kèm font số monospaced (`font-mono`) để các hàng số thẳng hàng theo hàng đơn vị/hàng chục, dễ quét mắt so sánh giữa các nhân sự.

## 2. Giải pháp kỹ thuật
- Trong file `src/app/projects/[projectId]/reports/page.tsx`:
  - Cập nhật các thẻ `<th>` của các cột số liệu: `Tổng việc`, `Hoàn thành`, `Đang làm`, `Quá hạn`, `Points (Xong/Tổng)` sang `text-right`.
  - Cập nhật các thẻ `<td>` tương ứng sang `text-right` và bổ sung `font-mono` cho các giá trị số.
  - Cột `Quá hạn`: căn phải huy hiệu số task quá hạn hoặc số 0.
  - Cột `Points (Xong/Tổng)`: căn phải biểu thức points `donePoints / totalPoints`.
  - Cột `Tỉ lệ hoàn thành`: duy trì căn phải với thanh tiến độ và chỉ số `%`.

---

## 3. Phases & Steps

### Phase 1: Triển khai căn phải ô số liệu trong Báo cáo & KPI
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Căn phải header và cell cho toàn bộ cột số liệu trong bảng Ma trận Báo cáo & KPI | Junior Developer | ✅ | `steps/STEP-1.1-align-numbers-right.md` | 2026-08-20 |

### Phase 2: Review, Verification & Smoke Test
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Code Review & UX/UI Review trực quan giao diện bảng | Tech Lead / UX-UI Reviewer | ✅ | `steps/STEP-2.1-review-and-ux.md` | 2026-08-20 |
| 2.2 | QA Smoke Test & DevOps Ready | QA Engineer / DevOps | ✅ | `steps/STEP-2.2-qa-smoke-test.md` | 2026-08-20 |

---

## 4. Artifacts hoàn thành
- [x] `src/app/projects/[projectId]/reports/page.tsx`
