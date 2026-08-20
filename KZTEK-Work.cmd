@echo off
title KZTEK Work Management — Desktop Client
setlocal enabledelayedexpansion

:: Thu mục làm việc
set "APP_DIR=%~dp0"
cd /d "%APP_DIR%"

echo =======================================================================
echo   KZTEK WORK MANAGEMENT — NATIVE DESKTOP CLIENT (ZALO STYLE)
echo =======================================================================
echo.

:: 1. Kiểm tra xem server localhost:3000 đã chạy chưa
set "SERVER_URL=http://localhost:3000"
set "SERVER_RUNNING=0"

powershell -NoProfile -Command "try { $res = Invoke-WebRequest -Uri 'http://localhost:3000/manifest.json' -TimeoutSec 1 -UseBasicParsing; if ($res.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "SERVER_RUNNING=1"
)

:: 2. Nếu server chưa chạy, khởi động server nền
if "!SERVER_RUNNING!"=="0" (
    echo [*] Dang khoi dong may chu lam viec KZTEK...
    start /min "KZTEK-Server" node ./node_modules/next/dist/bin/next start -p 3000
    timeout /t 2 /nobreak >nul
)

:: 3. Mở cửa sổ ứng dụng độc lập (Dedicated Native App Window - Không hiện trình duyệt)
echo [*] Dang mo cua so ung dung may tinh doc lap...

:: Ưu tiên 1: Microsoft Edge App Mode (có sẵn 100% trên Windows 10/11)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="!SERVER_URL!" --window-size=1600,980 --start-maximized --app-id=kztek-work-desktop
    goto :DONE
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="!SERVER_URL!" --window-size=1600,980 --start-maximized --app-id=kztek-work-desktop
    goto :DONE
)

:: Ưu tiên 2: Google Chrome App Mode
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="!SERVER_URL!" --window-size=1600,980 --start-maximized
    goto :DONE
)

:: Ưu tiên 3: Mở URL mặc định
start "" "!SERVER_URL!"

:DONE
echo [OK] Ung dung KZTEK Work Management da san sang!
timeout /t 1 >nul
exit
