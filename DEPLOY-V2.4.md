# BodyCheck v2.4 deployment

## What changed
- Reliable email/password registration with 15-second client timeout and clear errors.
- Google, Kakao and Naver OAuth connection flow.
- Admin-only user management tab and API.
- Automatic Prisma migration on Render container start.

## 1. Backend environment variables on Render
Keep the existing `DATABASE_URL`, `JWT_SECRET`, `HIRA_API_KEY`, `CORS_ORIGIN` and add:

```text
PUBLIC_API_BASE=https://bodycheck-api.onrender.com
ADMIN_EMAILS=your-admin-email@example.com
```

`ADMIN_EMAILS` can contain comma-separated email addresses. An existing account is promoted to ADMIN on the next successful password login if its email is listed here.

## 2. SNS login configuration
SNS login code is included, but each provider requires credentials issued to the service owner.

### Google
Set:
```text
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```
Register this redirect URI in Google Cloud:
```text
https://bodycheck-api.onrender.com/api/auth/oauth/google/callback
```

### Kakao
Set:
```text
KAKAO_REST_API_KEY=...
KAKAO_CLIENT_SECRET=...
```
Register this redirect URI in Kakao Developers:
```text
https://bodycheck-api.onrender.com/api/auth/oauth/kakao/callback
```
Enable account email/profile consent as needed.

### Naver
Set:
```text
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
```
Register this callback URL in Naver Developers:
```text
https://bodycheck-api.onrender.com/api/auth/oauth/naver/callback
```

The mobile return scheme is:
```text
bodycheck://auth
```

## 3. Deploy
Commit/push all v2.4 changes. Render will build the Docker image and run:
```text
npx prisma migrate deploy && npm start
```
This applies the auth/admin database migration automatically.

## 4. Admin access
1. Put the intended administrator email in `ADMIN_EMAILS`.
2. Save Render environment changes and redeploy.
3. Sign out/reinstall or reopen the app and log in with that email.
4. The `관리` tab appears only when `/api/me` returns `role: ADMIN`.

## 5. Mobile
Run:
```bash
cd mobile
npm install
npx expo install --fix
npx expo-doctor
npx eas-cli build -p android --profile preview
```

## Important for the current v2.3 repository
This v2.4 package is intended to be copied **over the existing v2.3 working tree**. Keep the existing initial migration directory (`backend/prisma/migrations/20260914044010_init`) already created in your repository. The v2.4 package adds only the new `20260914070000_auth_admin` migration.
