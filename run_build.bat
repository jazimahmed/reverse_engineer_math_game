@echo off
cd C:\Users\Administrator\Desktop\REA\android
call .\gradlew.bat assembleRelease
if errorlevel 1 (
    echo BUILD FAILED
) else (
    echo BUILD SUCCESS
)