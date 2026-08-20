# build-pixel-perfect-icon.ps1
Add-Type -AssemblyName System.Drawing

$AppDir = (Resolve-Path (Join-Path -Path $PSScriptRoot -ChildPath "..")).Path
$IcoPath = Join-Path -Path $AppDir -ChildPath "public\kztek-custom.ico"
$PngPath = Join-Path -Path $AppDir -ChildPath "public\kztek-custom.png"

$size = 256
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)

$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# 1. Background: Rounded Squircle with Dark Royal Navy & Violet Gradient
$rect = New-Object System.Drawing.Rectangle 8, 8, ($size - 16), ($size - 16)
$radius = 52

$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddArc($rect.X, $rect.Y, $radius, $radius, 180, 90)
$path.AddArc($rect.Right - $radius, $rect.Y, $radius, $radius, 270, 90)
$path.AddArc($rect.Right - $radius, $rect.Bottom - $radius, $radius, $radius, 0, 90)
$path.AddArc($rect.X, $rect.Bottom - $radius, $radius, $radius, 90, 90)
$path.CloseFigure()

# Background Gradient
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point 0, 0),
    (New-Object System.Drawing.Point $size, $size),
    [System.Drawing.Color]::FromArgb(255, 37, 28, 83),     # #251C53 (KZTEK Deep Navy)
    [System.Drawing.Color]::FromArgb(255, 18, 14, 45)      # #120E2D (Dark Obsidian)
)
$g.FillPath($bgBrush, $path)

# Subtle Outer/Inner Glow Border
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 100, 80, 190), 3)
$g.DrawPath($borderPen, $path)

# 2. Modern Productivity Element: Left Vertical Pillar (KZTEK Orange)
$pillarRect = New-Object System.Drawing.Rectangle 62, 58, 28, 140
$pillarRadius = 14
$pillarPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$pillarPath.AddArc($pillarRect.X, $pillarRect.Y, $pillarRadius, $pillarRadius, 180, 90)
$pillarPath.AddArc($pillarRect.Right - $pillarRadius, $pillarRect.Y, $pillarRadius, $pillarRadius, 270, 90)
$pillarPath.AddArc($pillarRect.Right - $pillarRadius, $pillarRect.Bottom - $pillarRadius, $pillarRadius, $pillarRadius, 0, 90)
$pillarPath.AddArc($pillarRect.X, $pillarRect.Bottom - $pillarRadius, $pillarRadius, $pillarRadius, 90, 90)
$pillarPath.CloseFigure()

$orangeBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point 62, 58),
    (New-Object System.Drawing.Point 62, 198),
    [System.Drawing.Color]::FromArgb(255, 255, 130, 45),   # Bright Orange #FF822D
    [System.Drawing.Color]::FromArgb(255, 240, 89, 34)     # KZTEK Orange #F05922
)
$g.FillPath($orangeBrush, $pillarPath)

# 3. Upper Right Diagonal Wing (Top of 'K' / Task Card)
$topPoints = @(
    (New-Object System.Drawing.PointF 98, 122),
    (New-Object System.Drawing.PointF 168, 62),
    (New-Object System.Drawing.PointF 194, 62),
    (New-Object System.Drawing.PointF 194, 84),
    (New-Object System.Drawing.PointF 132, 136)
)
$topBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point 98, 62),
    (New-Object System.Drawing.Point 194, 136),
    [System.Drawing.Color]::FromArgb(255, 255, 160, 60),
    [System.Drawing.Color]::FromArgb(255, 240, 89, 34)
)
$g.FillPolygon($topBrush, $topPoints)

# 4. Lower Right Checkmark / Task Arrow (Bottom of 'K')
$botPoints = @(
    (New-Object System.Drawing.PointF 112, 118),
    (New-Object System.Drawing.PointF 174, 178),
    (New-Object System.Drawing.PointF 194, 198),
    (New-Object System.Drawing.PointF 164, 198),
    (New-Object System.Drawing.PointF 96, 134)
)
$botBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point 96, 118),
    (New-Object System.Drawing.Point 194, 198),
    [System.Drawing.Color]::FromArgb(255, 240, 89, 34),
    [System.Drawing.Color]::FromArgb(255, 220, 60, 20)
)
$g.FillPolygon($botBrush, $botPoints)

# 5. Agile Kanban Accent Bar (Electric Cyan / Emerald Accent)
$accentRect = New-Object System.Drawing.Rectangle 130, 126, 52, 14
$accentRadius = 8
$accentPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$accentPath.AddArc($accentRect.X, $accentRect.Y, $accentRadius, $accentRadius, 180, 90)
$accentPath.AddArc($accentRect.Right - $accentRadius, $accentRect.Y, $accentRadius, $accentRadius, 270, 90)
$accentPath.AddArc($accentRect.Right - $accentRadius, $accentRect.Bottom - $accentRadius, $accentRadius, $accentRadius, 0, 90)
$accentPath.AddArc($accentRect.X, $accentRect.Bottom - $accentRadius, $accentRadius, $accentRadius, 90, 90)
$accentPath.CloseFigure()

$cyanBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point 130, 126),
    (New-Object System.Drawing.Point 182, 140),
    [System.Drawing.Color]::FromArgb(255, 0, 220, 200),    # Cyan/Teal #00DCC8
    [System.Drawing.Color]::FromArgb(255, 0, 180, 255)     # Sky Blue
)
$g.FillPath($cyanBrush, $accentPath)

# 6. Save as PNG & ICO
$bmp.Save($PngPath, [System.Drawing.Imaging.ImageFormat]::Png)

$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream $IcoPath, 'Create'
$icon.Save($fs)
$fs.Close()

# Clean up
$g.Dispose()
$bmp.Dispose()

# 7. Update Shortcut
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
Write-Host " DA TAO ICON VECTOR CHUYEN NGHIEP CHUAN PHAN MEM CHO DESKTOP:" -ForegroundColor Green
Write-Host " Shortcut: $ShortcutPath" -ForegroundColor Cyan
Write-Host " Icon: $IcoPath" -ForegroundColor Yellow
Write-Host "========================================================================"

try { ie4uinit.exe -show } catch {}
(Get-Item $ShortcutPath).LastWriteTime = Get-Date
