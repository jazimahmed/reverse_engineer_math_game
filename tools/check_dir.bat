@echo off
setlocal
set "SEARCH=checkbox"
echo.
echo Searching for "%SEARCH%" in node_modules...
echo.
dir /B /S "C:\Users\Administrator\Desktop\REA\node_modules" | find /I "%SEARCH%" > "%TEMP%\checkbox_results.txt"
if errorlevel 1 (
    echo NO FILES FOUND containing "%SEARCH%"
    type nul > "%TEMP%\checkbox_paths.txt"
) else (
    echo FILES FOUND:
    type "%TEMP%\checkbox_results.txt"
    copy "%TEMP%\checkbox_results.txt" "%TEMP%\checkbox_paths.txt"
)
echo.
echo Done.