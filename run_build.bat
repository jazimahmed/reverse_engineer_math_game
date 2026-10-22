@echo off
setlocal
cd /d "%~dp0android"
if errorlevel 1 exit /b 1
rem Build only the application and the two architectures needed for modern
rem Android phones and the x86_64 emulator. No retry loop or offline mode.
call .\gradlew.bat :app:assembleRelease -PreactNativeArchitectures=arm64-v8a,x86_64 --max-workers=2 --console=plain --stacktrace %*
set "BUILD_EXIT=%ERRORLEVEL%"
if not "%BUILD_EXIT%"=="0" (
    echo BUILD FAILED. Read the first What went wrong section above.
    exit /b %BUILD_EXIT%
)
if not exist "app\build\outputs\apk\release\app-release.apk" (
    echo BUILD FAILED: expected APK was not produced.
    exit /b 1
)
echo APK: %CD%\app\build\outputs\apk\release\app-release.apk
echo Research build signed with the existing debug key. Runtime fidelity verification pending.
exit /b 0
