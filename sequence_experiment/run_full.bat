@echo off
setlocal
cd /d "%~dp0"
python sequence_distance_bb84.py
if errorlevel 1 exit /b 1
echo.
echo Full SeQUeNCe CSV created at:
echo %cd%\results\distance_bb84.csv
pause
