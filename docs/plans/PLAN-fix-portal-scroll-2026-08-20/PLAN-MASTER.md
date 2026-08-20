---
task: fix-portal-page-scroll
created: 2026-08-20
updated: 2026-08-20
status: completed
workflow: WF-BUGFIX
priority: P2
---

# PLAN MASTER: Khắc Phục Lỗi Trang Customer Portal và Trang Công Cộng Không Thể Cuộn (Scroll Lock)

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở steps/STEP-[N.M]-[tên].md tương ứng.

## 1. Mô tả vấn đề
- Trên trang Cổng Báo Cáo Sự Cố & Hỗ Trợ Kỹ Thuật (/portal và /portal/[projectKey], /portal/tickets/[trackingCode]), người dùng/khách hàng không thể cuộn chuột hoặc vuốt màn hình để xem tiếp các phần bên dưới của form (như phần mô tả chi tiết, khu vực đính kèm ảnh/video, thông tin môi trường và nút Gửi Yêu Cầu).
- **Nguyên nhân gốc (Root Cause):** Trong src/app/layout.tsx, thẻ <body> được gắn class overflow-hidden và h-full. Điều này khóa chặt thanh cuộn cấp trang (viewport scroll), khiến mọi trang độc lập bên ngoài AppShell (như /portal, /portal/tickets/*, /welcome, v.v.) bị cắt nội dung và không thể cuộn được.

## 2. Giải pháp kỹ thuật
1. **src/app/layout.tsx:** Loại bỏ class overflow-hidden trên thẻ <body> và chuyển h-full sang min-h-full flex flex-col.
2. **src/app/globals.css:** Tối ưu hóa thẻ ody sử dụng min-height: 100%; min-height: -webkit-fill-available; (bỏ height: 100% cứng) để đảm bảo body co giãn tự nhiên theo độ dài nội dung trang trên mọi trình duyệt.
3. **Kiểm tra tính tương thích:**
   - Đảm bảo AppShell (/projects/[projectId]/*) vẫn giữ nguyên trải nghiệm desktop app với container h-screen overflow-hidden và các panel cuộn độc lập.
   - Đảm bảo Desktop Workstation (/desktop) hoạt động chuẩn xác với h-screen w-screen overflow-hidden.
   - Đảm bảo Customer Portal (/portal, /portal/[projectKey], /portal/tickets/[trackingCode]) cuộn mượt mà trên cả máy tính, máy tính bảng và điện thoại.

---

## 3. Phases & Steps

### Phase 1: Chẩn đoán & Viết Code Fix Lỗi Cuộn Trang
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Sửa src/app/layout.tsx và src/app/globals.css để gỡ bỏ khóa cuộn toàn cục, kiểm tra portal containers | Senior Developer | ✅ | steps/STEP-1.1-fix-portal-scroll.md | 2026-08-20 |

### Phase 2: Review, Verification & Smoke Test
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Tech Lead Review & UX/UI Review trực quan giao diện cuộn Customer Portal | Tech Lead / UX-UI Reviewer | ✅ | steps/STEP-2.1-review-and-ux.md | 2026-08-20 |
| 2.2 | QA Verification & DevOps Build Test | QA Engineer / DevOps Engineer | ✅ | steps/STEP-2.2-qa-verify-build.md | 2026-08-20 |

---

## 4. Artifacts hoàn thành
- [x] src/app/layout.tsx
- [x] src/app/globals.css
- [x] code-graph/CODE-GRAPH.md
