@echo off
cd /d "%~dp0"
call "%~dp0scripts\run-node.cmd" scripts\makecode.cjs setup
if errorlevel 1 pause
