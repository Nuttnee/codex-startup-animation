@echo off
chcp 65001 >nul
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0windows\Launch.ps1" %*
if errorlevel 1 (
  echo.
  echo Bộ khởi chạy đã dừng. Các tệp Codex đã cài không bị thay đổi.
  echo Nhấn phím bất kỳ để đóng cửa sổ.
  pause >nul
  exit /b 1
)
