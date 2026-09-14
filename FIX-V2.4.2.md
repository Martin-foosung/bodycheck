# BodyCheck v2.4.2 — Body Flow Fix

## Fixed
- Restored body-model-first symptom selection.
- Front/back body model with direct touch regions.
- Added detailed body-location step.
- Added symptom, intensity, onset, duration, trend, safety-question steps.
- Added Red Flag priority result, possible related causes, department guidance.
- Added health-record save and hospital-search handoff.
- Hospital screen now receives recommended department/care context.
- Email register/login now use the same direct POST network path; register no longer depends on wakeServer().
- Android versionCode 4, app version 2.4.2.

## Apply to existing repo
Copy the v2.4.2 files over the current project, but keep your local `backend/.env` and existing git history.

Then run:
```powershell
cd mobile
npm install
npx expo-doctor
cd ..
git add .
git commit -m "Restore body symptom flow and fix registration"
git push
cd mobile
npx eas-cli build -p android --profile preview
```
