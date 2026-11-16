@echo off
setlocal
cd /d "%~dp0"
python -m pip install -r requirements.txt
if errorlevel 1 exit /b 1
python sequence_distance_bb84.py --quick
if errorlevel 1 exit /b 1
echo.
echo Real SeQUeNCe CSV created at:
echo %cd%\results\distance_bb84.csv
pause
