# BodyCheck v2.4.1 authentication network hotfix

This hotfix addresses Android errors such as:

`fetch failed: Fetch request has been canceled`

## What changed

- Before login/register, the app calls `GET /api/health` to wake a sleeping Render instance.
- Server warm-up timeout: 90 seconds.
- Login/register request timeout: 45 seconds.
- Hospital request timeout: 60 seconds.
- Generic React Native cancellation/network errors are translated into Korean user-facing messages.
- Register POST requests are not automatically retried, avoiding accidental duplicate account creation.
- Android versionCode incremented for APK update installation.

## Deploy

Copy these files into the working repository:
- `mobile/src/services/api.js`
- `mobile/src/screens/LoginScreen.js`
- `mobile/app.json`
- `mobile/package.json`

Then:
```bash
npm install
npx expo-doctor
git add .
git commit -m "Fix Android auth network timeout"
git push
npx eas-cli build -p android --profile preview
```

Before rebuilding, verify this URL opens successfully in the phone browser:

`https://bodycheck-api.onrender.com/api/health`
