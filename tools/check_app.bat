@echo off
C:\Users\Administrator\AppData\Local\Android\Sdk\platform-tools\adb.exe shell pm list packages -d > "%TEMP%\packages.txt" 2>&1
find "independent" "%TEMP%\packages.txt" >nul && echo INSTALLED || echo NOTINSTALLED