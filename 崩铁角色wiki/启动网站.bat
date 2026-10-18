@echo off
title HSR Character Wiki - local server
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   [x] Node.js not found.
  echo       Please install Node.js 18 or newer from https://nodejs.org/
  echo       then double-click this file again.
  echo.
  pause
  exit /b 1
)

node "scripts\launch.mjs"

echo.
pause
