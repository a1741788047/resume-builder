@echo off
chcp 65001 >nul
rem ASCII only on purpose: cmd's code page handling mangles UTF-8 in .bat files.
cd /d "%~dp0"
title Resume Builder - Start

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\dev.ps1" -Action start
set "CODE=%ERRORLEVEL%"

echo.
if not "%CODE%"=="0" echo [ERROR] Startup failed. Please check the messages above.
echo Press any key to close this window...
pause >nul
exit /b %CODE%
