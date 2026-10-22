@echo off
setlocal
set "NODE_DIR=C:\Users\Administrator\Desktop\REA\node_modules"
set "TEMP_GRADLES=%TEMP%\all_gradle_%RANDOM%.txt"
echo.
echo Scanning for Gradle files with "checkbox"...
echo.
Get-ChildItem -Recurse "$NODE_DIR" -Filter "*.gradle" > "%TEMP_GRADLES%" 2>nul
find /I "checkbox" "%TEMP_GRADLES%" >nul
if errorlevel 1 (
    echo NO Gradle file mentions "checkbox"
) else (
    echo Gradle file(s) mentioning "checkbox" found:
    find /I "checkbox" "%TEMP_GRADLES%"
)
echo.
echo Total .gradle files scanned:
find /I "\.gradle" "%TEMP_GRADLES%" | find /I "." | find /I ":" | find /I "/" | find "." | find ":" | find " " && echo count: %count% || echo count unknown
echo.
del "%TEMP_GRADLES%" 2>nul