# BodyCheck v2.3 — Production App Architecture

This version transitions the project from a web MVP into a production-oriented mobile architecture.

## Structure
- `mobile/`: React Native (Expo) app scaffold
- `backend/`: Node.js / Express API server
- `backend/prisma/schema.prisma`: PostgreSQL data model
- HIRA API keys remain server-side only
- Health records are designed to be stored server-side

## Main flow
Body region → detailed region → symptom → severity/onset/duration/trend → safety questions → red-flag routing → possible causes → department → nearby hospitals → history

## Run
### Mobile
cd mobile
npm install
npx expo start

### Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npm run dev


## v2.3 Android Build Ready
- Added `mobile/app.json`
- Added `mobile/eas.json`
- Added APK (`preview`) and AAB (`production`) build profiles
- Added Android app icon/adaptive icon/splash placeholders
- Added explicit backend URL configuration
- Added `mobile/BUILD-ANDROID.md`
- Updated baseline to Expo SDK 57 / React Native 0.86


## v2.3 Cloud Connected
- Email/password registration and login.
- JWT authentication with 30-day tokens.
- Secure token storage in Expo SecureStore.
- Authenticated PostgreSQL health records.
- HIRA basic hospital search implementation with distance filtering.
- Dockerfile and Render Blueprint for internet deployment.
- Android app can point to a real HTTPS API through EAS environment variables.
