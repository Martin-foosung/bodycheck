@echo off
call npm install
if errorlevel 1 exit /b 1
call npx expo install --fix
call npx expo-doctor
call npx eas-cli build -p android --profile preview
pause
