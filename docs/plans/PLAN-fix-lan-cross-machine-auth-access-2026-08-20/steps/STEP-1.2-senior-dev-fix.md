# STEP-1.2: Sửa Cấu Hình Cookie LAN, Auth Routes, Allowed Origins & Host Binding

- **Agent**: Senior Developer
- **Trạng thái**: Hoàn thành ✅

## Nội dung thực hiện
1. Đã sửa [`src/lib/auth.ts`](file:///c:/Users/Flick/Desktop/kztek-work-management/src/lib/auth.ts):
   - Chuyển `secure: process.env.COOKIE_SECURE === "true"` (thay vì phụ thuộc `NODE_ENV === "production"` khiến kết nối HTTP LAN bị drop cookie).
   - Đặt `httpOnly: false`, `sameSite: "lax"`.
   - Cập nhật `destroySession` ghi đè cookie rỗng với `maxAge: 0`.
2. Đã sửa các route xác thực:
   - [`src/app/api/auth/login/route.ts`](file:///c:/Users/Flick/Desktop/kztek-work-management/src/app/api/auth/login/route.ts)
   - [`src/app/api/auth/register/route.ts`](file:///c:/Users/Flick/Desktop/kztek-work-management/src/app/api/auth/register/route.ts)
   - [`src/app/api/auth/logout/route.ts`](file:///c:/Users/Flick/Desktop/kztek-work-management/src/app/api/auth/logout/route.ts)
3. Đã mở rộng `allowedDevOrigins` trong [`next.config.ts`](file:///c:/Users/Flick/Desktop/kztek-work-management/next.config.ts) với wildcard LAN (`192.168.*`, `10.*`, `172.16.*` -> `172.31.*`, `*.local`, `*.lan`).
4. Đã cập nhật host binding `-H 0.0.0.0` trong [`package.json`](file:///c:/Users/Flick/Desktop/kztek-work-management/package.json) và [`KZTEK-Work.cmd`](file:///c:/Users/Flick/Desktop/kztek-work-management/KZTEK-Work.cmd).

## Handoff Log
- Chuyển sang Bước 1.3: Tech Lead review code & kiểm tra an toàn bảo mật.
