# generate-ico.ps1
Add-Type -AssemblyName System.Drawing

$AppDir = (Resolve-Path (Join-Path -Path $PSScriptRoot -ChildPath "..")).Path
$PngPath = Join-Path -Path $AppDir -ChildPath "Kztek_Logo.png"
$IcoPath = Join-Path -Path $AppDir -ChildPath "public\kztek-app.ico"
$PublicPngPath = Join-Path -Path $AppDir -ChildPath "public\Kztek_Logo.png"

# 1. Copy PNG to public folder if not there
if (Test-Path $PngPath) {
    Copy-Item -Path $PngPath -Destination $PublicPngPath -Force
}

# 2. Convert PNG to high-quality .ico file using System.Drawing
if (Test-Path $PngPath) {
    $bmp = [System.Drawing.Bitmap]::FromFile($PngPath)
    
    # Tao bitmap vuong kich thuoc 256x256 de lam icon dep
    $sqBmp = New-Object System.Drawing.Bitmap 256, 256
    $g = [System.Drawing.Graphics]::FromImage($sqBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Ve logo vao giua khung vuong
    $width = $bmp.Width
    $height = $bmp.Height
    $ratio = [Math]::Min(256.0 / $width, 256.0 / $height)
    $newW = [int]($width * $ratio)
    $newH = [int]($height * $ratio)
    $posX = [int]((256 - $newW) / 2)
    $posY = [int]((256 - $newH) / 2)
    
    $g.DrawImage($bmp, $posX, $posY, $newW, $newH)
    
    $hIcon = $sqBmp.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($hIcon)
    
    $fs = New-Object System.IO.FileStream $IcoPath, 'Create'
    $icon.Save($fs)
    $fs.Close()
    
    $g.Dispose()
    $sqBmp.Dispose()
    $bmp.Dispose()
    
    Write-Host "[OK] Da tao file ICO chat luong cao tai: $IcoPath" -ForegroundColor Green
}

# 3. Cap nhat Desktop Shortcut
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
Write-Host " DA CAP NHAT ICON LOGO KZTEK CHO SHORTCUT TAI DESKTOP:" -ForegroundColor Green
Write-Host " $ShortcutPath" -ForegroundColor Cyan
Write-Host " Icon: $IcoPath" -ForegroundColor Yellow
Write-Host "========================================================================"
