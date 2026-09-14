# BodyCheck v2.3 deployment

## 1. Deploy PostgreSQL + API
This repository includes `render.yaml` and `backend/Dockerfile`.

On Render:
1. Create a Blueprint from this repository.
2. Render creates `bodycheck-db` and `bodycheck-api`.
3. Set `HIRA_API_KEY` in the API service environment.
4. Deploy.
5. Open `/api/health` and verify `{ ok: true }`.

Before first production use run the Prisma migration:
```bash
cd backend
npx prisma migrate dev --name init
```
Commit the generated migration directory, then deploy with:
```bash
npx prisma migrate deploy
```

## 2. Connect the mobile app
Set the deployed HTTPS URL in `mobile/eas.json`:

```json
"EXPO_PUBLIC_API_BASE": "https://YOUR-BODYCHECK-API.onrender.com"
```

Then:
```bash
cd mobile
npm install
npx expo install --fix
npx expo-doctor
npx eas-cli login
npx eas-cli init
npm run build:apk
```

## 3. Test on Android
- Create an account in the app.
- Allow location permission.
- Open `병원`.
- Search nearby hospitals.
- Open `기록` and verify authenticated health-history retrieval.

## Production warnings
- HIRA API responses and coordinate coverage must be validated with the issued service key.
- The current hospital scoring is a recommendation heuristic, not a clinical diagnosis.
- Red-flag medical logic still requires clinician review before public launch.
- Configure restrictive CORS and production secrets before public release.
