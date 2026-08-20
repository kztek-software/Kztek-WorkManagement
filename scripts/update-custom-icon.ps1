# update-custom-icon.ps1
Add-Type -AssemblyName System.Drawing

$AppDir = (Resolve-Path (Join-Path -Path $PSScriptRoot -ChildPath "..")).Path
$ImgPath = "C:\Users\Flick\.gemini\antigravity\brain\ed09ff8a-0652-48e9-b100-094210d280c0\desktop_app_icon_1787063376067.jpg"
$IcoPath = Join-Path -Path $AppDir -ChildPath "public\kztek-custom.ico"
$PublicPng = Join-Path -Path $AppDir -ChildPath "public\kztek-custom.png"

if (Test-Path $ImgPath) {
    $bmp = [System.Drawing.Bitmap]::FromFile($ImgPath)
    
    # Save PNG
    $bmp.Save($PublicPng, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Tao Icon vuong 256x256
    $sqBmp = New-Object System.Drawing.Bitmap 256, 256
    $g = [System.Drawing.Graphics]::FromImage($sqBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $g.DrawImage($bmp, 0, 0, 256, 256)
    
    $hIcon = $sqBmp.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($hIcon)
    
    $fs = New-Object System.IO.FileStream $IcoPath, 'Create'
    $icon.Save($fs)
    $fs.Close()
    
    $g.Dispose()
    $sqBmp.Dispose()
    $bmp.Dispose()
    
    Write-Host "[OK] Da tao thanh cong file ICO tuy bien tai: $IcoPath" -ForegroundColor Green
}

# Cap nhat Desktop Shortcut
$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "KZTEK Work Management.lnk"
$TargetPath = Join-Path -Path $AppDir -ChildPath "KZTEK-Work.cmd"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetPath
$Shortcut.WorkingDirectory = $AppDir
$Shortcut.Description = "KZTEK Work Management - Native Desktop Client"
$Shortcut.IconLocation = "$IcoPath,0"
$Shortcut.Save()

Write-Host "========================================================================"
Write-Host " DA CAP NHAT ICON MOI RIENG BIET CHO SHORTCUT DESKTOP:" -ForegroundColor Green
Write-Host " Shortcut: $ShortcutPath" -ForegroundColor Cyan
Write-Host " Icon: $IcoPath" -ForegroundColor Yellow
Write-Host "========================================================================"

try { ie4uinit.exe -show } catch {}
(Get-Item $ShortcutPath).LastWriteTime = Get-Date
