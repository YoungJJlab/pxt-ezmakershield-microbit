@echo off
setlocal
rem Optional per-machine settings stay in .dev, which is not published.
if defined EZMAKER_NODE goto run
if exist "%~dp0..\.dev\node-path.txt" set /p "EZMAKER_NODE="<"%~dp0..\.dev\node-path.txt"
if defined EZMAKER_NODE goto run
where node >nul 2>nul
if errorlevel 1 goto missing
set "EZMAKER_NODE=node"
:run
"%EZMAKER_NODE%" %*
exit /b %errorlevel%
:missing
echo Node.js not found. Install Node.js 24 and reopen VS Code, or set EZMAKER_NODE to node.exe's full path.
echo See LOCAL_DEVELOPMENT.md for first-time setup.
exit /b 1
