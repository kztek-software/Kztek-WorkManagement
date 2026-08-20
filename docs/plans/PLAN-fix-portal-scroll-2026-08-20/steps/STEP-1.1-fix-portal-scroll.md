# STEP-1.1: Gỡ bỏ khóa cuộn viewport toàn cục trong layout.tsx và globals.css

- **Agent:** Senior Developer (L4)
- **Status:** Completed
- **Files liên quan:**
  - src/app/layout.tsx
  - src/app/globals.css

## Nội dung thực hiện
1. Điều chỉnh src/app/layout.tsx:
   - Gỡ bỏ overflow-hidden trên <body>.
   - Cập nhật className từ h-full flex flex-col bg-background text-foreground selection:bg-accent/30 overflow-hidden sang min-h-full flex flex-col bg-background text-foreground selection:bg-accent/30.
2. Điều chỉnh src/app/globals.css:
   - Bỏ height: 100% trên selector ody, giữ min-height: 100%; min-height: -webkit-fill-available; để body co giãn tự do theo kích thước nội dung.
3. Kiểm tra các trang Portal (/portal, /portal/[projectKey], /portal/tickets/[trackingCode]) và AppShell (/projects/[projectId]/*).

## Handoff Log
- Đã gỡ bỏ triệt để nguyên nhân gây khóa thanh cuộn viewport trên toàn bộ các trang công cộng và portal. Chuyển giao sang Tech Lead & UX/UI Reviewer đánh giá.
