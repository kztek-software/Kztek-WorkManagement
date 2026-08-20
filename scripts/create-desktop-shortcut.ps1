# create-desktop-shortcut.ps1
# Tao shortcut ung dung KZTEK Work Management tren Desktop cua Windows

$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "KZTEK Work Management.lnk"

$AppDir = (Resolve-Path (Join-Path -Path $PSScriptRoot -ChildPath "..")).Path
$TargetPath = Join-Path -Path $AppDir -ChildPath "KZTEK-Work.exe"
$IconPath = Join-Path -Path $AppDir -ChildPath "public\kztek-custom.ico"
if (-not (Test-Path $IconPath)) {
    $IconPath = Join-Path -Path $AppDir -ChildPath "public\favicon.ico"
}

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetPath
$Shortcut.WorkingDirectory = $AppDir
$Shortcut.Description = "KZTEK Work Management - Native Standalone Desktop Application"
$Shortcut.IconLocation = "$TargetPath,0"
$Shortcut.Save()

Write-Host "========================================================================"
Write-Host " Da tao Shortcut ung dung tai Desktop:" -ForegroundColor Green
Write-Host " $ShortcutPath" -ForegroundColor Cyan
Write-Host "========================================================================"
