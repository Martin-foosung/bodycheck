# BodyCheck Android APK build

## Requirements
- Node.js 22.13+ recommended for Expo SDK 57
- Expo account
- EAS CLI

## Install
```bash
npm install
npx expo install --fix
npx expo-doctor
```

## Configure backend URL
Open `eas.json` and replace:

`https://CHANGE_ME.example.com`

with the real HTTPS URL of the BodyCheck backend.

## Initialize EAS once
```bash
npx eas-cli login
npx eas-cli init
```

## Build APK
```bash
npm run build:apk
```

Equivalent:
```bash
eas build -p android --profile preview
```

## Build Google Play AAB
```bash
npm run build:aab
```

## Notes
- `preview` creates an APK for direct install/testing.
- `production` creates an AAB for Google Play.
- Android package is currently `com.bodycheck.health`; confirm it is unique before store release.
- Increment `android.versionCode` for every Play Store release.
