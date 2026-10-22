@echo off
Get-ChildItem -Recurse "%~dp1node_modules" -Filter "*.gradle" > "%TEMP%\gradles.txt" 2>&1
FindStr "checkbox" "%TEMP%\gradles.txt" >nul
if errorlevel 1 (
    echo NO_CHECKBOX_GRADLE
) else (
    echo HAS_CHECKBOX_GRADLE
)