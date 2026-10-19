@echo off
chcp 65001 >nul
rem ASCII only on purpose: cmd's code page handling mangles UTF-8 in .bat files.
cd /d "%~dp0"
title Resume Builder - Stop

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\dev.ps1" -Action stop

echo.
echo Press any key to close this window...
pause >nul
exit /b 0
